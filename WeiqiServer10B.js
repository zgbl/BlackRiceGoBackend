const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
// 设置允许的源

  
const uuid = require('uuid');
//const mysql = require('mysql2');
const path = require('path');

const app = express();
const server = http.createServer(app);
//const io = socketIo(server);
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3001', 'http://www.blackrice.pro'];
  const io = socketIo(server, {
    cors: {
      //origin: allowedOrigins,
      origin: ["https://*.brackrice.pro", "http://localhost:8090", "http://localhost:3001"],
      methods: ["GET", "POST"]
    }
  });
const { ObjectId } = require('mongodb');

const fs = require('fs');
const fsPromises = fs.promises;

//const mongoose = require('mongoose');

//在服务器文件的顶部声明一个数组来暂时存储帖子  2024.7.13 临时
let posts = [];

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true })); // To handle form data
app.use(express.json());  //这行可能是重复的

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

const users = new Map();
const games = new Map();

//MySQL 暂时不用，先注释掉
/*
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'mySQLpass',
  database: 'BlackRiceGo',
  port: '3308'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL');
  }
});
*/

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('login', (username) => {
    console.log(`Received login event. Username: ${username}, Socket ID: ${socket.id}`);
    users.set(socket.id, username);
    socket.emit('loginSuccess', { id: socket.id, username });
    console.log(`User logged in: ${username} with socket ID: ${socket.id}`);
  });

  socket.on('findMatch', () => {
    console.log(`User ${socket.id} is looking for a match`);
    const availablePlayer = [...users.entries()].find(([id, _]) => id !== socket.id && !games.has(id));

    if (availablePlayer) {
      const gameId = uuid.v4();
      const [opponentId, opponentName] = availablePlayer;
      const startTime = new Date();
      const game = {
        id: gameId,
        players: [
          { id: socket.id, name: users.get(socket.id) },
          { id: opponentId, name: opponentName }
        ],
        currentPlayer: 0,
        board: Array(19).fill().map(() => Array(19).fill(null)),
        moves: [],
        startTime: startTime
      };
      games.set(gameId, game);

      io.to(socket.id).emit('gameStart', game);
      io.to(opponentId).emit('gameStart', game);
      console.log(`Game started between ${socket.id} and ${opponentId}`);
    } else {
      socket.emit('waitingForOpponent');
      console.log(`User ${socket.id} is waiting for an opponent`);
    }
  });

  socket.on('move', ({ gameId, row, col }) => {
    console.log(`Received move for gameId: ${gameId}, row: ${row}, col: ${col}`);
    const game = games.get(gameId);
    if (game && game.players[game.currentPlayer].id === socket.id) {
      const color = game.currentPlayer === 0 ? 'black' : 'white';
      game.board[row][col] = color;
      game.moves.push({ row, col, color });
      game.currentPlayer = 1 - game.currentPlayer;

      io.to(game.players[0].id).emit('updateBoard', game);
      io.to(game.players[1].id).emit('updateBoard', game);
      console.log(`Move processed: ${color} stone at (${row}, ${col})`);
    }
  });

  //socket.on('resgin') 部分重写，用MongoDB代替mySQL,2024.7.14
  /*
  socket.on('resign', ({ gameId, playerId }) => {
    console.log(`Player ${playerId} resigned in game ${gameId}`);
    const game = games.get(gameId);
    if (game) {
      const endTime = new Date();
      const duration = new Date(endTime - game.startTime).toISOString().substr(11, 8);
      const winnerId = game.players.find(player => player.id !== playerId).id;
      const blackPlayerId = game.players[0].id;
      const whitePlayerId = game.players[1].id;
      const sgfPath = `/qipu/${gameId}.sgf`;

      const sql = 'INSERT INTO GameRecord (gameId, blackPlayerId, whitePlayerId, winnerId, gameDuration, sgfPath) VALUES (?, ?, ?, ?, ?, ?)';
      
      // 打印SQL语句和参数
        console.log('SQL:', sql);
        console.log('Parameters:', [name, date, location, entry_conditions, format]);
      db.query(sql, [gameId, blackPlayerId, whitePlayerId, winnerId, duration, sgfPath], (err, result) => {
        if (err) {
          console.error('Error inserting game result into MySQL:', err);
        } else {
          console.log('Game result inserted into MySQL:', result);
        }
      });

      io.to(game.players[0].id).emit('gameOver', { winnerId, loserId: playerId });
      io.to(game.players[1].id).emit('gameOver', { winnerId, loserId: playerId });
      games.delete(gameId);
    }
  });
    */

  //下面加入新写的mongoDB代码，2024.7.14

  socket.on('resign', async ({ gameId, playerId }) => {
    console.log(`Player ${playerId} resigned in game ${gameId}`);
    const game = games.get(gameId);
    if (game) {
      const endTime = new Date();
      const duration = new Date(endTime - game.startTime).toISOString().substr(11, 8);
      const winnerId = game.players.find(player => player.id !== playerId).id;
      const blackPlayerId = game.players[0].id;
      const whitePlayerId = game.players[1].id;
      const sgfPath = `/qipu/${gameId}.sgf`;

      const gameRecord = {
        gameId,
        blackPlayerId,
        whitePlayerId,
        winnerId,
        gameDuration: duration,
        sgfPath,
        createdAt: new Date()
      };

      try {
        //const collection = mongoDb.collection('GameRecords');
        const collection = mongoose.connection.db.collection('GameRecords');
        const result = await collection.insertOne(gameRecord);
        if (result.acknowledged) {
          console.log('Game result inserted into MongoDB:', result.insertedId);
        } else {
          console.error('Failed to insert game result');
        }
      } catch (error) {
        console.error('Error inserting game result into MongoDB:', error);
      }

      io.to(game.players[0].id).emit('gameOver', { winnerId, loserId: playerId });
      io.to(game.players[1].id).emit('gameOver', { winnerId, loserId: playerId });
      games.delete(gameId);
    }
  });


  socket.on('disconnect', () => {
    users.delete(socket.id);
    console.log('Client disconnected:', socket.id);
  });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'BlackRiceGoMain.html'));
});

app.get('/match', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'match.html'));
});


app.post('/create_tournament', (req, res) => {
  const { name, date, location, entry_conditions, format } = req.body;

  console.log('Received data is:', req.body);  // 添加这行来检查接收到的数据

  const sql = 'INSERT INTO Tournaments (name, date, location, entry_conditions, format) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [name, date, location, entry_conditions, format], (err, result) => {
    if (err) {
      console.error('Error creating tournament:', err);
      res.status(500).json({ success: false, message: 'Error creating tournament' });
    } else {
      const tournament_id = result.insertId;
      res.json({ success: true, tournament_id: tournament_id });
    }
  });
});

// 创建比赛的路由
app.post('/create_tournament', (req, res) => {
    const { name, date, location, entry_conditions, format } = req.body;
    const sql = 'INSERT INTO Tournaments (name, date, location, entry_conditions, format) VALUES (?, ?, ?, ?, ?)';
    
    // 打印SQL语句和参数
    //console.log('Received data:', req.body);
    //console.log('SQL:', sql);
    //console.log('Parameters:', [name, date, location, entry_conditions, format]);
    
    db.query(sql, [name, date, location, entry_conditions, format], (err, result) => {
        if (err) {
            console.error('Error creating tournament:', err);
            res.status(500).json({ success: false, message: 'Error creating tournament' });
        } else {
            res.json({ success: true });
        }
    });
});


app.get('/manage_tournament/:tournament_id', (req, res) => {
  const tournament_id = req.params.tournament_id;
  res.send(`管理比赛页面: ${tournament_id}`);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.get('/get_players', (req, res) => {
  const tournament_id = req.query.tournament_id;
  
  if (!tournament_id) {
    return res.status(400).json({ error: 'Tournament ID is required' });
  }

  const sql = `
    SELECT p.player_id, p.name, tp.rank
    FROM Players p
    JOIN TournamentParticipants tp ON p.player_id = tp.player_id
    WHERE tp.tournament_id = ?
    ORDER BY tp.rank DESC
  `;

  db.query(sql, [tournament_id], (err, results) => {
    if (err) {
      console.error('Error fetching players:', err);
      return res.status(500).json({ error: 'Error fetching players' });
    }
    
    res.json(results);
  });
});

// MongoDB connection URL  //准备用Mongoose Connection代替掉
/*
const { MongoClient } = require('mongodb');
const mongoUrl = 'mongodb+srv://carsontu:rWkzpUGumChb3m10@blackricemongo.t7k7zg3.mongodb.net/blackrice?retryWrites=true&w=majority';
const dbName = 'blackrice';  //也许换MongoDB Atlas 就不用这个了
let mongoDb;

async function connectToMongo() {
    try {
        const client = await MongoClient.connect(mongoUrl);
        mongoDb = client.db('blackrice');
        console.log('Connected to MongoDB Atlas');
    } catch (error) {
        console.error('Error connecting to MongoDB Atlas:', error);
    }
}
去掉 mongodb 连接，改用mongoose
connectToMongo();
*/

//添加mongoose连接
const mongoose = require('mongoose');
const PostSchema = new mongoose.Schema({
  title: String,
  content: String,
  createdAt: { type: Date, default: Date.now }
});
const mongoUrl = 'mongodb+srv://carsontu:rWkzpUGumChb3m10@blackricemongo.t7k7zg3.mongodb.net/blackrice?retryWrites=true&w=majority';

//mongoose.connect(mongoUrl, {
//  useNewUrlParser: true,
//  useUnifiedTopology: true
//})
mongoose.connect(mongoUrl)
.then(() => console.log('Connected to MongoDB Atlas via Mongoose'))
.catch(err => {
  console.error('Error connecting to MongoDB Atlas:', err);
  process.exit(1);
});

// 添加新的路由来保存棋谱
app.post('/save-qipu', async (req, res) => {
    if (!mongoDb) {
        console.error('MongoDB not connected');
        return res.status(500).json({ success: false, error: 'Database not connected' });
    }

    const qipuData = req.body;

    try {
        //const collection = mongoDb.collection('Qipu');   //改用mongoose 连接
        const collection = mongoose.connection.collection('Qipu');   //改用mongoose 连接
        const result = await collection.insertOne(qipuData);
        
        if (result.acknowledged) {
            console.log('Document inserted successfully:', result.insertedId);
            res.json({ success: true });
        } else {
            console.error('Failed to insert document');
            res.status(500).json({ success: false, error: 'Failed to insert document' });
        }
    } catch (error) {
        console.error('Error saving qipu to MongoDB:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

async function testMongoConnection() {
  try {
      const collections = await mongoDb.listCollections().toArray();
      console.log('Connected to database:', mongoDb.databaseName);
      console.log('Available collections:', collections.map(c => c.name));
  } catch (error) {
      console.error('Error testing MongoDB connection:', error);
  }
}

//connectToMongo().then(testMongoConnection);

//增加新的路由，处理发布变化图  2024/7/12
app.post('/publish-variation', async (req, res) => {
    if (!mongoDb) {
        return res.status(500).json({ success: false, error: 'MongoDB not connected' });
    }

    const variationData = req.body;

    try {
        //const collection = mongoDb.collection('Variations');
        const collection = mongoose.connection.collection('Variations');
        const result = await collection.insertOne(variationData);
        
        if (result.acknowledged) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, error: 'Failed to insert variation' });
        }
    } catch (error) {
        console.error('Error saving variation to MongoDB:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

//增加附件文件处理功能
const multer = require('multer');

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dir = path.join('Attachments', year.toString(), month, day);
    
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 限制文件大小为5MB
}).single('file'); //



// 处理论坛发帖  sgf 内容直接存入mongoDB 2024/7/16
const Post = mongoose.model('Post', PostSchema);  //2024/7/21 改用model

app.post('/forum/post', (req, res) => {
    upload(req, res, async function (err) {
      if (err) {
        console.error('Error uploading file:', err);
        return res.status(500).json({ success: false, error: err.message });
      }
  
      const { title, content } = req.body;
      let sgfContent = null;
      
      if (req.file && req.file.path.endsWith('.sgf')) {
        try {
          sgfContent = await fsPromises.readFile(req.file.path, 'utf8');
          // 读取文件内容后，删除临时文件
          await fsPromises.unlink(req.file.path);
        } catch (fileError) {
          console.error('Error reading SGF file:', fileError);
        }
      }
  
      const newPost = { 
        title, 
        content, 
        sgfContent,
        createdAt: new Date()
      };
  
      try {
        //const collection = mongoDb.collection('Posts');
        const collection = mongoose.connection.collection('Posts');
        const result = await collection.insertOne(newPost);
        
        if (result.acknowledged) {
          console.log('Post saved to MongoDB:', result.insertedId);
          res.json({ success: true, post: { ...newPost, _id: result.insertedId } });
        } else {
          console.error('Failed to insert post');
          res.status(500).json({ success: false, error: 'Failed to insert post' });
        }
      } catch (error) {
        console.error('Error saving post to MongoDB:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
    });
  });

//添加一个新的路由来获取帖子列表  2024.7.13
//app.get('/forum/posts', (req, res) => {
//  console.log('Sending posts:', posts);
//  res.json(posts);
//});
app.get('/forum/posts', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = 5;

  try {
    //const collection = mongoDb.collection('Posts');
    const collection = mongoose.connection.collection('Posts');
    //console.log("app.get('/forum/posts', 检查MongoDB是否连接成功", collection); //输出过于详细庞大，不是总需要
    console.log("Received request for /forum/posts. MongoDB connection status:", mongoose.connection.readyState);
    const totalPosts = await collection.countDocuments();
    const totalPages = Math.ceil(totalPosts / pageSize);

    const posts = await collection.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    res.json({
      posts: posts,
      currentPage: page,
      totalPages: totalPages,
      hasNextPage: page < totalPages
    });
  } catch (error) {
    console.error('Error fetching posts from MongoDB:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// 处理Post.html 显示
   //重写这个路由，改用mongoose 2024/7/20
app.get('/api/post/:id', async (req, res) => {
    let postId = req.params.id.trim();
    console.log('Requested post ID:', postId);
  
    try {
      if (!ObjectId.isValid(postId)) {
        return res.status(400).json({ error: 'Invalid post ID format' });
      }
  
      //const collection = mongoDb.collection('Posts');
      const collection = mongoose.connection.collection('Posts');
      const post = await collection.findOne({ _id: new ObjectId(postId) });
  
      if (post) {
        console.log('Fetched post:', post);
        res.json(post);
      } else {
        res.status(404).json({ error: 'Post not found' });
      }
    } catch (error) {
      console.error('Error fetching post from MongoDB:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });  
  
  //先导入comment模型
  //const Comment = require('./models/Comment');
  /*
  app.get('/api/comments/:postId', async (req, res) => {
    const postId = req.params.postId;
    
    try {
        const collection = mongoDb.collection('Comments');
        const comments = await collection.find({ postId: new ObjectId(postId) })
            .sort({ createdAt: -1 })
            .toArray();
        
        res.json(comments);
    } catch (error) {
        console.error('Error fetching comments from MongoDB:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
*/


  const Comment = require('./models/Comment'); // 确保路径正确

  app.get('/api/comments/:postId', async (req, res) => {
      const postId = req.params.postId;

      try {
          // 使用 Mongoose 模型查询
          const comments = await Comment.find({ post: new mongoose.Types.ObjectId(postId) })
              .sort({ createdAt: -1 })
              .exec();

          res.json(comments);
      } catch (error) {
          console.error('Error fetching comments:', error);
          res.status(500).json({ error: 'Internal server error' });
      }
  });

//添加新的路由来获取特定的帖子  2024.7.13
//添加路由处理帖子的评论 2024.7.16
/*
app.post('/api/comments/:postId', async (req, res) => {
  const postId = req.params.postId;
  const { content } = req.body;

  console.log(`Attempting to add comment for post ${postId}: ${content}`);

  try {
    const comment = {
      postId: new ObjectId(postId),
      content,
      createdAt: new Date()
    };

    console.log('Comment object:', comment);

    const collection = mongoDb.collection('Comments');
    console.log('Before inserting comment');
    const result = await collection.insertOne(comment);
    console.log('After inserting comment, result:', result);

    if (result.acknowledged) {
      console.log('Comment added successfully');
      res.json({ success: true, comment: { ...comment, _id: result.insertedId } });
    } else {
      console.error('Failed to insert comment');
      res.status(500).json({ success: false, error: 'Failed to insert comment' });
    }
  } catch (error) {
    console.error('Error saving comment to MongoDB:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});  */

//合并发布comment text和 变化图 2024/7/20
app.post('/api/comments/:postId', async (req, res) => {
  try {
      const { content, variation } = req.body;
      const postId = req.params.postId;

      const newComment = new Comment({
          content: content,
          post: postId,
          variation: variation
      });

      await newComment.save();

      res.json({ success: true, comment: newComment });
  } catch (error) {
      console.error('Error saving comment:', error);
      res.status(500).json({ success: false, error: 'Error saving comment' });
  }
});
