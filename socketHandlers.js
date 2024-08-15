const uuid = require('uuid');

const users = new Map();
const games = new Map();

const setupSocketIO = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('login', (username) => {
      // 登录逻辑
    });

    socket.on('findMatch', () => {
      // 匹配逻辑
    });

    socket.on('move', ({ gameId, row, col }) => {
      // 移动逻辑
    });

    socket.on('resign', async ({ gameId, playerId }) => {
      // 认输逻辑
    });

    socket.on('disconnect', () => {
      users.delete(socket.id);
      console.log('Client disconnected:', socket.id);
    });
  });
};

module.exports = { setupSocketIO };