import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import fs from 'fs/promises';

export const getPosts = async (req, res) => {
  try {
    console.log('Querying Posts collection...');
    const page = parseInt(req.query.page) || 1;
    const pageSize = 5;
    const query = {};
    console.log('Query:', JSON.stringify(query));

    const totalCount = await Post.countDocuments(query);
    console.log(`Total documents matching query: ${totalCount}`);

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

    console.log(`Found ${posts.length} posts for page ${page}`);

    res.json({
      posts: posts,
      currentPage: page,
      totalPages: Math.ceil(totalCount / pageSize),
      hasNextPage: page * pageSize < totalCount
    });
  } catch (error) {
    console.error('Error in getPosts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createPost = async (req, res) => {
  let sgfContent = null;
  console.log("req.body is", req.body);
  console.log("req.userID is", req.body.userID);
  console.log("req auther is", req.body.author);
  try {
    const { title, content } = req.body;
    const userID = req.body.userID;  // 获取当前登录用户的ID   8/10
    const author = req.body.author;  // 获取当前登录用户的username   8/10

    // Check if a file is uploaded and if it is an SGF file
    /*if (req.file) {
      if (req.file.mimetype === 'application/x-go-sgf' || req.file.originalname.endsWith('.sgf')) {
        sgfContent = req.file.buffer.toString('utf8'); // Convert buffer to string
      } else {
        console.error('Uploaded file is not an SGF file.');
        // Optionally handle the case where the file is not an SGF
      }
    } */

    // Check if a file is uploaded and if it is an SGF or GIB file
    if (req.file) {
      const fileType = req.file.mimetype;
      const fileName = req.file.originalname;
      
      if (fileType === 'application/x-go-sgf' || fileName.endsWith('.sgf')) {
        // Handle SGF file
        sgfContent = req.file.buffer.toString('utf8'); // Convert buffer to string
      } else if (fileType === 'application/octet-stream' || fileName.endsWith('.gib')) {
        // Handle GIB file
        const gibContent = req.file.buffer.toString('utf8'); // Convert buffer to string
        sgfContent = GIBtoSGF(gibContent); // Convert GIB to SGF using your conversion function
      } else {
        console.error('Uploaded file is not an SGF or GIB file.');
        // Optionally handle the case where the file is not an SGF or GIB
      }
    }
    
    
    // 创建一个新的帖子
    const newPost = new Post({
      title,
      content,
      userID,     //增加userID 字段 8/10  要在上面先获取
      author,
      sgfContent, 
      createdAt: new Date()
    });
    // 保存帖子到数据库
    //await newPost.save();
    const savedPost = await newPost.save();
    console.log('New post created:', savedPost);

    res.status(201).json({ success: true, post: savedPost });
  } catch (error) {
    console.error('创建帖子时出错:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

export const getPost = async (req, res) => {
  try {
    const postId = req.params.id;
    console.log(`Attempting to fetch post with ID: ${postId}`);

    const post = await Post.findById(postId);
    
    if (!post) {
      console.log(`Post with ID ${postId} not found`);
      return res.status(404).json({ message: 'Post not found' });
    }

    console.log(`Successfully fetched post: ${post.title}`);
    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export async function GIBtoSGF(gibContent) {
  let info = {};
  let moves = '';
  let Hcap = 0;

  // Split the GIB content into lines for processing
  const lines = gibContent.split(/\r?\n/);

  for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith('\\HS')) {
          continue; // Header line, skip it
      }

      if (/GAMEWHITELEVEL/.test(trimmedLine)) {
          info.wr = trimmedLine.split('=')[1].trim();
      } else if (/GAMEBLACKLEVEL/.test(trimmedLine)) {
          info.br = trimmedLine.split('=')[1].trim();
      } else if (/GAMEBLACKNICK/.test(trimmedLine)) {
          info.bp = trimmedLine.split('=')[1].trim();
      } else if (/GAMEWHITENICK/.test(trimmedLine)) {
          info.wp = trimmedLine.split('=')[1].trim();
      } else if (/GAMERESULT/.test(trimmedLine)) {
          info.res = trimmedLine.split('=')[1].trim();
      } else if (/GAMEWHITENAME/.test(trimmedLine)) {
          info.wname = trimmedLine.split('=')[1].trim();
      } else if (/GAMEBLACKNAME/.test(trimmedLine)) {
          info.bname = trimmedLine.split('=')[1].trim();
      } else if (/GAMEDATE/.test(trimmedLine)) {
          const [_, yr, mn, dy] = trimmedLine.match(/GAMEDATE=(\d{4})(\d{2})(\d{2})/);
          info.date = `${yr}-${mn}-${dy}`;
      } else if (/GAMETAG/.test(trimmedLine)) {
          break;
      } else if (/INI\s+[\d]+\s+[\d]+\s+[\d]+/.test(trimmedLine)) {
          const [_, , , hcap] = trimmedLine.match(/INI\s+[\d]+\s+[\d]+\s+([\d]+)/);
          Hcap = parseInt(hcap);
      } else if (/STO/.test(trimmedLine)) {
          const [_, , , colorCode, x, y] = trimmedLine.match(/STO\s+[\d]+\s+[\d]+\s+([\d]+)\s+([\d]+)\s+([\d]+)/);
          const col = String.fromCharCode(parseInt(x) + 96);
          const row = String.fromCharCode(parseInt(y) + 96);
          const color = colorCode == 1 ? 'B' : 'W';
          moves += `;${color}[${col}${row}]`;
      }
  }

  const wp = info.wp || info.wname || '';
  const bp = info.bp || info.bname || '';
  const wr = info.wp ? info.wr || '' : '';
  const br = info.bp ? info.br || '' : '';
  const res = info.res || '';
  const date = info.date || '';

  let sgfContent = `(;GM[1]FF[4]CA[UTF-8]AP[gokifu.com]SO[http://gokifu.com]ST[1]
SZ[19]PW[${wp}]WR[${wr}]PB[${bp}]BR[${br}]RE[${res}]DT[${date}]
`;

  if (Hcap > 0) {
      sgfContent += `HA[${Hcap}]`;
  }

  const handicapPositions = {
      2: 'AB[pd][dp]',
      3: 'AB[pd][dp][pp]',
      4: 'AB[dd][pd][dp][pp]',
      5: 'AB[dd][pd][jj][dp][pp]',
      6: 'AB[dd][pd][dj][pj][dp][pp]',
      7: 'AB[dd][pd][dj][jj][pj][dp][pp]',
      8: 'AB[dd][jd][pd][dj][pj][dp][jp][pp]',
      9: 'AB[dd][jd][pd][dj][jj][pj][dp][jp][pp]'
  };

  if (Hcap >= 2 && Hcap <= 9) {
      sgfContent += handicapPositions[Hcap];
  }

  sgfContent += moves;
  sgfContent += ')';

  return sgfContent;
}