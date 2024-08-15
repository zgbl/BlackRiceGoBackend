// services/authService.js
import User from '../models/User.js';
import bcrypt from 'bcrypt';

const findUserByUsername = async (username) => {
  return await User.findOne({ username });
};

const createUser = async (userData) => {
  const newUser = new User(userData);
  return await newUser.save();
};

// 添加其他认证相关的服务函数

export default {
  findUserByUsername,
  createUser
  // 添加其他需要导出的函数
};