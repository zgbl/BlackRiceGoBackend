require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { setupSocketIO } = require('./socketHandlers');
//const { connectDB } = require('./config/database');
const MongoStore = require('connect-mongo');
const listEndpoints = require('express-list-endpoints');
//从database.js中导入currentDbUri变量
const { connectDB, getCurrentDbUri } = require('./database');

// 导入路由
const routes = require('./routes/index-bak');
const forumRoutes = require('./routes/forumRoutes');
const commentRoutes = require('./routes/commentRoutes');
const authRoutes = require('./routes/auth');

//const errorHandler = require('./middlewares/errorHandler');

const app = express();
const server = http.createServer(app);

// 设置允许的源
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000', 'http://localhost:8090', 'http://www.blackrice.pro'];

// 中间件设置
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// CORS 设置
app.use(cors({
  origin: function(origin, callback) {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// 确保在使用 session 中间件之前调用 connectDB
await connectDB();
// 会话配置
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    //mongoUrl: process.env.MONGODB_URI,       //这里只用一个DB URI, 在切换DB的时候，会造成问题。
    //mongoUrl: process.env.MONGO_URI_BACKUP,
    mongoUrl: getCurrentDbUri(),
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Passport 初始化（放在 session 中间件之后）
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

app.use((req, res, next) => {
  console.log('Session:', req.session);
  console.log('User:', req.user);
  next();
});

// 路由设置
app.use('/', routes);
app.use('/auth', authRoutes);
app.use('/forum', forumRoutes);
app.use('/comments', commentRoutes); // 修改这里，移除 '/api' 前缀
//console.log('Comment routes registered at /comments', commentRoutes);

// 错误处理中间件 --要在其他路由之后导入
//app.use((err, req, res, next) => {
//  console.error('Error:', err);
//  res.status(500).json({ success: false, error: 'Internal server error' });
//});
const errorHandler = require('./middleware/errorHandler');

//检查error
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not defined in the environment variables');
  process.exit(1);
}

// 连接数据库
console.log('MONGODB_URI:', process.env.MONGODB_URI);
connectDB();



// 设置 Socket.IO
const io = require('socket.io')(server, {
  cors: {
    //origin: allowedOrigins,
    origin: ["https://*.brackrice.pro", "http://localhost:8090"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

setupSocketIO(io);

// 在设置完所有路由之后，在服务器启动之前添加：
console.log('Registered routes:');
console.log(listEndpoints(app));

// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));