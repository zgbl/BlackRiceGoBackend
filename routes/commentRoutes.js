
import express from 'express';
import { getComments, addComment } from '../controllers/commentController.js';

const router = express.Router();

router.get('/:postId', getComments);
router.post('/:postId', addComment);

export default router;