import express from 'express';
import authRoutes from '../routes/auth.js';
import forumRoutes from '../routes/forumRoutes.js';
import commentRoutes from '../routes/commentRoutes.js';
import { connectDB } from '../config/database.js';
import cors from 'cors';

const app = express();

// 中间件设置
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由设置
app.use('/auth', authRoutes);
app.use('/forum', forumRoutes);
app.use('/comments', commentRoutes);

// 根路由
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the API' });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// 初始化函数
const initializeApp = async () => {
  try {
    await connectDB();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    process.exit(1);
  }
};

// 导出处理函数
export default async (req, res) => {
  await initializeApp();
  return app(req, res);
};

// 导出路由，以便在其他地方使用
export { authRoutes, forumRoutes, commentRoutes };