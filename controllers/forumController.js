import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import fs from 'fs/promises';
import GIBtoSGF1 from '../js/gib2sgf1.js';

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
        sgfContent = await GIBtoSGF1(gibContent); // Convert GIB to SGF using your conversion function
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
