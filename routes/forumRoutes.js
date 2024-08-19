
import express from 'express';
import { getPosts, createPost, getPost } from '../controllers/forumController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/posts', getPosts);
router.post('/post', upload.single('file'), createPost);
router.get('/post/:id', getPost);

export default router;