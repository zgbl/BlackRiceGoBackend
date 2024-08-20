import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';  //改用bycryptjs 8/18

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,  // 这将自动设置注册时间
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  loginCount: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

// 验证密码的方法
//UserSchema.methods.verifyPassword = async function(candidatePassword) {
//  return bcrypt.compare(candidatePassword, this.password);
//};

UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// 更新登录信息的方法
UserSchema.methods.updateLoginInfo = function() {
  this.lastLogin = new Date();
  this.loginCount += 1;
  return this.save();
};

const User = mongoose.model('User', UserSchema);

export default User;