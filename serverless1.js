import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import MongoStore from 'connect-mongo';
import listEndpoints from 'express-list-endpoints';

import { connectDB, getCurrentDbUri } from './config/database.js';
import configurePassport from './config/passport.js';
import routes, { forumRoutes, commentRoutes, authRoutes } from './api/index.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:8090', 'http://www.blackrice.pro', 'http://192.168.0.152:8090'];

// Middleware setup
// 移除静态文件中间件，因为我们不再使用 /public 目录
// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
  origin: function(origin, callback) {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

const initializeApp = async () => {
  try {
    await connectDB();
    console.log('Database connected successfully');

    // Session setup
    app.use(session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({ mongoUrl: getCurrentDbUri() })
    }));

    // Passport setup
    configurePassport(passport);
    app.use(passport.initialize());
    app.use(passport.session());

    // Routes setup
    // 移除 /match 路由，因为不再支持
    // app.get('/match', (req, res) => {
    //   res.sendFile(path.join(__dirname, 'public', 'match.html'));
    // });

    app.use('/forum', forumRoutes);
    app.use('/comments', commentRoutes);
    app.use('/auth', authRoutes);

    // Root route
    app.get('/', (req, res) => {
      res.status(200).json({ message: 'Welcome to the API' });
    });

    app.use(errorHandler);

    console.log('App initialized successfully');
    
    // 打印所有路由，方便调试
    console.log(listEndpoints(app));
  } catch (err) {
    console.error('Failed to initialize app:', err);
    throw err;
  }
};

// 不要立即导出 app，而是导出一个函数
export default async function() {
  await initializeApp();
  return app;
}