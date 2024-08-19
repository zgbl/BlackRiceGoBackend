/*const express = require('express');
const router = express.Router();
const { getPosts, createPost, getPost } = require('../controllers/forumController');
//const { getComments, addComment } = require('../controllers/commentController');
const upload = require('../middleware/upload');

router.get('/posts', getPosts);
router.post('/post', upload.single('file'), createPost);
router.get('/post/:id', getPost);

module.exports = router;
*/
/*import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  title: String,
  content: String,
  sgfContent: String,
  createdAt: { type: Date, default: Date.now }
}, { collection: 'Posts' });

export default mongoose.model('Post', PostSchema, 'Posts');
*/

import express from 'express';
import cors from 'cors';
import { getPosts, createPost, getPost } from '../controllers/forumController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/posts', getPosts);
router.post('/post', upload.single('file'), createPost);
router.get('/post/:id', getPost);

export default router;