const mongoose = require('mongoose')

const TagSchema = new mongoose.Schema(
  {
    name:      { type: String, required: true, trim: true },
    slug:      { type: String, required: true, unique: true, lowercase: true },
    postCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Tag', TagSchema)