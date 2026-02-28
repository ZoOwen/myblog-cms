const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema(
  {
    post:   { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    author: {
      name:   { type: String, required: true, trim: true },
      email:  { type: String, required: true, lowercase: true },
      avatar: { type: String, default: null },
    },
    content: { type: String, required: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    likes: { type: Number, default: 0 },
  },
  { timestamps: true }
)

CommentSchema.index({ post: 1, status: 1, createdAt: 1 })
CommentSchema.index({ parent: 1 })

module.exports = mongoose.model('Comment', CommentSchema)