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
  try {
    const { title, content } = req.body;
    let sgfContent = '';

    if (req.file) {
      // 如果上传了文件，读取文件内容
      sgfContent = req.file.buffer.toString('utf-8');
    }

    const newPost = new Post({
      title,
      content,
      sgfContent,
      // 其他需要的字段
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: '创建帖子时发生错误', error: error.message });
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