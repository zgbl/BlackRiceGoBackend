import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export default function(passport) {
  console.log('Inside Passport configuration function');
  passport.use(new LocalStrategy(
    async function(username, password, done) {
      try {
        const user = await User.findOne({ username: username });
        if (!user) {
          console.log('User not found:', username);
          return done(null, false, { message: 'Incorrect username.' });
        }
        console.log('Found user:', user.username);
        console.log('Stored password hash:', user.password);
        console.log('Provided password:', password);

        // 显示输入的密码和数据库中的哈希
        console.log('Input password:', password);
        console.log('Stored hashed password:', user.password);
        
        const isMatch = await bcrypt.compare(password, user.password);
        console.log("登录时，输入的password is:", password);
        console.log("登录时, 存储的user.password is:", user.password);

        console.log('Password match result:', isMatch);
        
        if (!isMatch) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
      } catch (err) {
        console.error('Error in passport strategy:', err);
        return done(err);
      }
    }
  ));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}