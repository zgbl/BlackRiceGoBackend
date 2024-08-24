import express from 'express';
import { getPosts, createPost, getPost } from '../controllers/forumController.js';

const router = express.Router();

router.get('/posts', getPosts);
router.post('/post', createPost);
router.get('/post/:id', getPost);

export default router;