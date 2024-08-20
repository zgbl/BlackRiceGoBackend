import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import localStrategy from './local-strategy.js';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export default function(passport) {
  console.log('Configuring Passport');
  
  passport.use('local', localStrategy);

  console.log('Local strategy configured');

  passport.serializeUser((user, done) => {
    console.log('Serializing user:', user.id);
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    console.log('Deserializing user:', id);
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      console.error('Error deserializing user:', err);
      done(err);
    }
  });

  console.log('Passport configuration complete');
}