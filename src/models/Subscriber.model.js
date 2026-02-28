const mongoose = require('mongoose')
const crypto = require('crypto')

const SubscriberSchema = new mongoose.Schema(
  {
    email:       { type: String, required: true, unique: true, lowercase: true },
    isConfirmed: { type: Boolean, default: false },
    token:       { type: String, default: () => crypto.randomBytes(32).toString('hex') },
    confirmedAt: { type: Date, default: null },
    source:      { type: String, default: 'blog' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Subscriber', SubscriberSchema)