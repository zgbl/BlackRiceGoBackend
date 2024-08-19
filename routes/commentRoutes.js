// routes/commentRoutes.js
/*const express = require('express');
const router = express.Router();
const { getComments, addComment } = require('../controllers/commentController');

router.get('/:postId', getComments);
router.post('/:postId', addComment);

module.exports = router; */

import express from 'express';
import cors from 'cors';
import { getComments, addComment } from '../controllers/commentController.js';

const router = express.Router();

router.get('/:postId', getComments);
router.post('/:postId', addComment);

export default router;