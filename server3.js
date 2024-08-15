import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import http from 'http'; 
import path from 'path';
import { fileURLToPath } from 'url';
import { Server as SocketIOServer } from 'socket.io';
import MongoStore from 'connect-mongo';
import listEndpoints from 'express-list-endpoints';

//import { setupSocketIO } from './socketHandlers.js';  //还没有这个文件。暂时comment掉
import { connectDB, getCurrentDbUri } from './config/database.js';
import configurePassport from './config/passport.js';
import routes, { forumRoutes, commentRoutes, authRoutes } from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:8090', 'http://www.blackrice.pro', 'http://192.168.0.152:8090'];

// Middleware setup
app.use(express.static(path.join(__dirname, 'public')));
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

const startServer = async () => {
  try {
    await connectDB();

    app.use(session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: getCurrentDbUri(),
        collectionName: 'sessions'
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
      }
    }));

    app.use(passport.initialize());
    app.use(passport.session());
    configurePassport(passport);

    app.use((req, res, next) => {
      console.log('Session:', req.session);
      console.log('User:', req.user);
      next();
    });

    // Routes setup
    app.use('/', routes);
    app.use('/auth', authRoutes);
    app.use('/forum', forumRoutes);
    app.use('/comments', commentRoutes);

    app.use(errorHandler);

    // Socket.IO setup
    const io = new SocketIOServer(server, {
      cors: {
        origin: ["https://*.blackrice.pro", "http://localhost:8090", "http://192.168.0.152:8090"],
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    //setupSocketIO(io);  //暂时不用socketIO   8/7

    // Log registered routes
    console.log('Registered routes:');
    console.log(listEndpoints(app));

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not defined in the environment variables');
  process.exit(1);
}

startServer();