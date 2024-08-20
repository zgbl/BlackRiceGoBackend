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

const allowedOrigins = ['https://zgbl.github.io'];

let isPassportConfigured = false;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// 处理OPTIONS预检请求
app.options('*', cors());

const configurePassportOnce = () => {
  if (!isPassportConfigured) {
    console.log('Configuring Passport');
    configurePassport(passport);
    isPassportConfigured = true;
    console.log('Passport configured successfully');
  }
};

const initializeApp = async () => {
  try {
    await connectDB();
    console.log('Database connected successfully');

    app.use(session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({ mongoUrl: getCurrentDbUri() }),
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
      }
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    //configurePassport(passport);
    configurePassportOnce();

    app.use('/forum', forumRoutes);
    app.use('/comments', commentRoutes);
    app.use('/auth', authRoutes);

    app.get('/', (req, res) => {
      res.status(200).json({ message: 'Welcome to the API' });
    });

    app.use(errorHandler);

    console.log('App initialized successfully');
    console.log(listEndpoints(app));
  } catch (err) {
    console.error('Failed to initialize app:', err);
    throw err;
  }
};

export default async (req, res) => {
  if (!app.initialized) {
    await initializeApp();
    app.initialized = true;
  }
  // 每次请求都重新初始化 Passport
  //passport.initialize()(req, res, () => {});
  //passport.session()(req, res, () => {});

  //configurePassportOnce();
  //return app(req, res);
  passport.initialize()(req, res, () => {
    console.log('Passport initialized');
    passport.session()(req, res, () => {
      console.log('Passport session initialized');
      configurePassportOnce();
      console.log('Passport once configured');
      console.log('req is:', req);
      return app(req, res);
    });
  });
};
