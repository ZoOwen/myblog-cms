const mongoose = require('mongoose')

const CategorySchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    slug:        { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: '' },
    color:       { type: String, default: '#00ff41' },
    postCount:   { type: Number, default: 0 },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Category', CategorySchema)