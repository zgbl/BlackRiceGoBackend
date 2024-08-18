import express from 'express';
//import authController from '../controllers/authController.js';
import passport from 'passport';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { login, registerUser, logout } from '../controllers/authController.js';

const router = express.Router();
//router.post('/login', authController.login);
//router.post('/login', (req, res, next) => {
/*router.post('/login', passport.authenticate('local'), (req, res) => {
  passport.authenticate('local', async (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    try {
      await user.updateLoginInfo();
      req.logIn(user, (err) => {
        if (err) return next(err);
        return res.json({ 
          message: 'Login successful', 
          user: { 
            id: user._id, 
            username: user.username,
            lastLogin: user.lastLogin,
            loginCount: user.loginCount
          } 
        });
        //return res.json({ message: 'Login successful', user: { id: user._id, username: user.username } });
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
}); */

router.post('/login', (req, res, next) => {
  console.log('Login attempt for user:', req.body.username);

  req.logout((err) => {
    if (err) {
      console.error('Error logging out:', err);
      return next(err);
    }

    passport.authenticate('local', (err, user, info) => {
    
      if (err) {
        console.error('Authentication error:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
      if (!user) {
        console.log('Login failed for user:', req.body.username);
        console.log('Reason:', info.message); // 添加这行来查看失败原因
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      req.logIn(user, (err) => {
        if (err) {
          console.error('Login error:', err);
          return res.status(500).json({ message: 'Error logging in' });
        }
        console.log('Login successful for user:', user.username);
        return res.json({
          message: 'Login successful',
          user: {
            id: user._id,
            username: user.username
          },
          //redirectTo: '/forum'  //server不要redirect
        });
      });
    })(req, res, next);

  });
  

});


//router.get('/logout', authController.logout);
router.get('/logout', logout);

//router.post('/register', authController.register);
router.post('/register', async (req, res) => {
  try {
      const { username, email, password } = req.body;

      // Check if user already exists
      let user = await User.findOne({ $or: [{ email }, { username }] });
      if (user) {
          return res.status(400).json({ message: 'User already exists' });
      }

      // Create new user
      user = new User({
          username,
          email,
          password
      });

      // Hash password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      //user.password = password  //临时跳过哈希，明文存储密码，作为测试
      console.log("DB 将存储的user.password is:", user.password);
      console.log("比较是不是一致？输入的passowrd is:", password);

      // Save user to database
      await user.save();

      // 手动登录用户
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        //res.status(201).json({ message: 'User registered and logged in successfully', user: { id: user._id, username: user.username } });
        res.status(201).json({ 
          message: 'User registered and logged in successfully', 
          user: { 
            id: user._id, 
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            loginCount: user.loginCount
          } 
        });
      });

      //res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
      next(error);
  }
});

//module.exports = router;
export default router;