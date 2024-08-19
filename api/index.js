/*// /routes/index.js
import authRoutes from './auth.js';
import forumRoutes from './forumRoutes.js';
import commentRoutes from './commentRoutes.js';
// 导入其他路由...

export default {
  authRoutes,
  forumRoutes,
  commentRoutes,
  // 导出其他路由...
};  */


/*
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import forumRoutes from '../routes/forumRoutes.js';
import commentRoutes from '../routes/commentRoutes.js';
import authRoutes from '../routes/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.get('/match', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'match.html'));
});

router.use('/forum', forumRoutes);
router.use('/comments', commentRoutes);
router.use('/auth', authRoutes);

export { router as default, forumRoutes, commentRoutes, authRoutes };
*/

import authRoutes from '../routes/auth.js';
import forumRoutes from '../routes/forumRoutes.js';
import commentRoutes from '../routes/commentRoutes.js';

// Export these routes as named exports
export { authRoutes, forumRoutes, commentRoutes };

import app from '../serverless1.js';
export default app;
