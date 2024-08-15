// controllers/commentController.js
//const Comment = require('../models/Comment');

/*
exports.getComments = async (req, res) => {
  // 获取评论逻辑
  try {
    const postId = req.params.postId; // 从请求参数中获取帖子的ID
    console.log(`Attempting to fetch comments for post with ID: ${postId}`);
    const comments = await Comment.find({ postId: postId });
    if (!comments || comments.length === 0) {
      console.log(`No comments found for post with ID ${postId}`);
      //return res.json([]);
      res.json(comments); //即使没有评论，也会返回一个空数组
    }
    console.log(`Successfully fetched ${comments.length} comments for post ID: ${postId}`);
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; */
/*
exports.getComments = async (req, res) => {
  console.log('getComments function called');
  try {
    const { postId } = req.params;
    console.log(`Fetching comments for post: ${postId}`);
    const comments = await Comment.find({ postId });
    console.log(`Found ${comments.length} comments for post ID: ${postId}`);
    
    // 只发送一次响应
    if (!res.headersSent) {
      res.json(comments); // 即使没有评论，也发送空数组
    } else {
      console.log('Headers already sent, skipping response');
    }
  } catch (error) {
    console.error('Error in getComments:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    } else {
      console.error('Headers already sent, cannot send error response');
    }
  }
};


// 添加评论逻辑
exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, originalMoves, variationMoves } = req.body;

    console.log('Received comment data:', { postId, content, originalMoves, variationMoves });

    // 验证 moves 数据
    const validateMoves = (moves) => {
      return Array.isArray(moves) && moves.every(move => 
        typeof move === 'object' &&
        'row' in move && typeof move.row === 'number' &&
        'col' in move && typeof move.col === 'number' &&
        'color' in move && typeof move.color === 'string'
      );
    };

    if (!validateMoves(originalMoves) || !validateMoves(variationMoves)) {
      return res.status(400).json({ success: false, error: 'Invalid moves data format' });
    }
    const newComment = new Comment({
      postId,
      content,
      originalMoves,
      variationMoves
    });

    const savedComment = await newComment.save();
    console.log('Comment saved successfully:', savedComment);

    res.status(201).json({ success: true, comment: savedComment });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}; */

// controllers/commentController.js
import Comment from '../models/Comment.js';

export const getComments = async (req, res) => {
  console.log('getComments function called');
  try {
    const { postId } = req.params;
    console.log(`Fetching comments for post: ${postId}`);
    const comments = await Comment.find({ postId });
    console.log(`Found ${comments.length} comments for post ID: ${postId}`);
    
    if (!res.headersSent) {
      res.json(comments);
    } else {
      console.log('Headers already sent, skipping response');
    }
  } catch (error) {
    console.error('Error in getComments:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    } else {
      console.error('Headers already sent, cannot send error response');
    }
  }
};

export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, originalMoves, variationMoves } = req.body;

    console.log('Received comment data:', { postId, content, originalMoves, variationMoves });

    const validateMoves = (moves) => {
      return Array.isArray(moves) && moves.every(move => 
        typeof move === 'object' &&
        'row' in move && typeof move.row === 'number' &&
        'col' in move && typeof move.col === 'number' &&
        'color' in move && typeof move.color === 'string'
      );
    };

    if (!validateMoves(originalMoves) || !validateMoves(variationMoves)) {
      return res.status(400).json({ success: false, error: 'Invalid moves data format' });
    }
    const newComment = new Comment({
      postId,
      content,
      originalMoves,
      variationMoves
    });

    const savedComment = await newComment.save();
    console.log('Comment saved successfully:', savedComment);

    res.status(201).json({ success: true, comment: savedComment });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};