import express from 'express';
import { getPosts, createPost, getPost } from '../controllers/forumController.js';
import upload, { handleUpload } from '../middleware/upload.js';

const router = express.Router();

router.get('/posts', getPosts);
router.post('/post', upload.single('file'), handleUpload, createPost);
router.get('/post/:id', getPost);

export default router;