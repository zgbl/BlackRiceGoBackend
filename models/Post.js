import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
  //  required: true
  },
  sgfContent: {
    type: String
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  author: {
    type: String,
    required: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  //fileUrl: {
  //  type: String
  //},
  //tags: [{
  //  type: String
  //}]
}, { 
  collection: 'Posts',
  timestamps: true // 这会自动管理 createdAt 和 updatedAt 字段
});

export default mongoose.model('Post', PostSchema);