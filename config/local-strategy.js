import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const localStrategy = new LocalStrategy(
  async function(username, password, done) {
    console.log('Local strategy being executed');
    try {
      const user = await User.findOne({ username: username });
      if (!user) {
        console.log('User not found:', username);
        return done(null, false, { message: 'Incorrect username.' });
      }
      console.log('Found user:', user.username);
      
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Password match result:', isMatch);
      
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    } catch (err) {
      console.error('Error in local strategy:', err);
      return done(err);
    }
  }
);

export default localStrategy;