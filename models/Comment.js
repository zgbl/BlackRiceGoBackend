//const mongoose = require('mongoose');

/*const CommentSchema = new mongoose.Schema({
  content: String,
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  variation: Object,
  createdAt: { type: Date, default: Date.now }
});*/

/*const MoveSchema = new mongoose.Schema({
  row: Number,
  col: Number,
  color: String
}, { _id: false });

const CommentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  content: { type: String, required: true },
  //originalMoves: [String],
  //variationMoves: [String],
  originalMoves: [MoveSchema],   //Move 结构改成Object，以保留颜色信息
  variationMoves: [MoveSchema],  
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Comment', CommentSchema);
*/

import mongoose from 'mongoose';

const MoveSchema = new mongoose.Schema({
  row: Number,
  col: Number,
  color: String
}, { _id: false });

const CommentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  content: { type: String, required: true },
  originalMoves: [MoveSchema],
  variationMoves: [MoveSchema],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Comment', CommentSchema);