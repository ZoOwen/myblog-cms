const mongoose = require('mongoose')

const AnalyticSchema = new mongoose.Schema({
  post:      { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  ip:        { type: String, default: null },
  userAgent: { type: String, default: '' },
  referrer:  { type: String, default: '' },
  country:   { type: String, default: '' },
  viewedAt:  { type: Date, default: Date.now },
})

AnalyticSchema.index({ post: 1, viewedAt: -1 })
AnalyticSchema.index({ viewedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 })

module.exports = mongoose.model('Analytic', AnalyticSchema)
