import express from 'express';
import passport from 'passport';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import cors from 'cors';

const router = express.Router();

const corsOptions = {
  origin: 'https://zgbl.github.io', // or your allowed origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

router.use(cors(corsOptions));

router.post('/login', (req, res, next) => {
  console.log('Login attempt for user:', req.body.username);
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('Authentication error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    if (!user) {
      console.log('Login failed for user:', req.body.username, 'Reason:', info.message);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    req.logIn(user, (err) => {
      console.log("starting login process");
      console.log("req.logIn(user", user);
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
        }
      });
    });
  })(req, res, next);
});

router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: 'Error logging out' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

router.post('/register', async (req, res) => {
  try {
    console.log('req object at register route:', req); // Add this line to inspect `req`
    console.log('req.login function 是什么 (auth.js line 59):', req.login); // This should print the `req.login` function or `undefined`
    console.log('req.body 是:', req.body);
    console.log('req.headers 是:', req.headers);

    const { username, email, password } = req.body;
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    user = new User({ username, email, password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    req.logIn(user, (err) => {
      if (err) {
        console.error('Auto-login after registration failed:', err);
        return res.status(500).json({ message: 'Registration successful, but auto-login failed' });
      }
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
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;