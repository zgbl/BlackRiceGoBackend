/*const Post = require('../models/Post');
const Comment = require('../models/Comment');
const fs = require('fs');
const fsPromises = fs.promises; */
/* exports.getPosts = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = 5;
  
    try {
      //const collection = mongoDb.collection('Posts');
      //const collection = mongoose.connection.collection('Posts');
      //console.log("app.get('/forum/posts', 检查MongoDB是否连接成功", collection); //输出过于详细庞大，不是总需要
      //console.log("Received request for /forum/posts. MongoDB connection status:", mongoose.connection.readyState);
      //const totalPosts = await collection.countDocuments();
      const totalPosts = await Post.countDocuments();
      const totalPages = Math.ceil(totalPosts / pageSize);
  
      const posts = await Post.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        //.toArray();
      
      console.log('Found posts:', posts); // 添加这行来检查是否成功获取到帖子
  
      res.json({
        posts: posts,
        currentPage: page,
        totalPages: totalPages,
        hasNextPage: page < totalPages
      });
    } catch (error) {
      console.error('Error fetching posts from MongoDB:', error);
      //res.status(500).json({ success: false, error: 'Internal server error' });
      res.status(500).json({ error: 'Internal server error' });
    }
}; */

/*
exports.getPosts = async (req, res) => {
  try {
    console.log('Querying Posts collection...');
    const page = parseInt(req.query.page) || 1;
    const pageSize = 5;
    const query = {};
    console.log('Query:', JSON.stringify(query));

    const totalCount = await Post.countDocuments(query);
    console.log(`Total documents matching query: ${totalCount}`);

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })  // 按创建时间降序排序
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

exports.createPost = async (req, res) => {

  let sgfContent = null;
  // 创建帖子逻辑
  try {
    const { title, content } = req.body;

    if (req.file && req.file.path.endsWith('.sgf')) {
      try {
        sgfContent = await fsPromises.readFile(req.file.path, 'utf8');
        // 读取文件内容后，删除临时文件
        await fsPromises.unlink(req.file.path);
      } catch (fileError) {
        console.error('Error reading SGF file:', fileError);
      }
    }
    
    const newPost = new Post({
      title,
      content,
      sgfContent, 
      createdAt: new Date()
    });

    const savedPost = await newPost.save();

    console.log('New post created:', savedPost);
    //res.status(201).json(savedPost);
    res.status(201).json({ success: true, post: savedPost });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getPost = async (req, res) => {
  // 获取单个帖子逻辑
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
*/

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
  try {
    const { title, content } = req.body;
    const userID = req.user.id;  // 获取当前登录用户的ID   8/10
    const author = req.user.username;  // 获取当前登录用户的username   8/10

    if (req.file && req.file.path.endsWith('.sgf')) {
      try {
        sgfContent = await fs.readFile(req.file.path, 'utf8');
        await fs.unlink(req.file.path);
      } catch (fileError) {
        console.error('Error reading SGF file:', fileError);
      }
    }
    
    const newPost = new Post({
      title,
      content,
      userID,     //增加userID 字段 8/10  要在上面先获取
      author,
      sgfContent, 
      createdAt: new Date()
    });

    const savedPost = await newPost.save();

    console.log('New post created:', savedPost);
    res.status(201).json({ success: true, post: savedPost });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Internal server error' });
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


