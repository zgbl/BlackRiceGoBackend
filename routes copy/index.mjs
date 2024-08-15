import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import forumRoutes from './forumRoutes.js';
import commentRoutes from './commentRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.get('/match', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'match.html'));
});

router.use('/forum', forumRoutes);
router.use('/comments', commentRoutes);

export default router;