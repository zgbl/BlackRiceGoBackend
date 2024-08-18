import authService from '../services/authService.js';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import User from '../models/User.js';

const saltRounds = 10;

export const login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error logging in' });
      }
      return res.json({ 
        success: true, 
        message: 'Login successful', 
        user: { id: user._id, username: user.username }
      });
    });
  })(req, res, next);
};

export const registerUser = async (username, email, hashedPassword) => {
  try {
    // 检查用户是否已存在
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return { success: false, message: 'User already exists' };
    }

    // 创建新用户
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    // 保存用户到数据库
    await newUser.save();

    return { success: true };
  } catch (error) {
    console.error('Error in registerUser service:', error);
    throw error;
  }
};

export const logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out' });
    }
    res.redirect('/');
  });
};