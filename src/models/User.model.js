const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const { BCRYPT_ROUNDS } = require('../config/env')

const UserSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    avatar:   { type: String, default: null },
    role:     { type: String, enum: ['admin', 'author'], default: 'author' },
    bio:      { type: String, maxlength: 300, default: '' },
    socials: {
      github:   { type: String, default: '' },
      twitter:  { type: String, default: '' },
      linkedin: { type: String, default: '' },
    },
    isActive:       { type: Boolean, default: true },
    lastLogin:      { type: Date, default: null },
    resetToken:     { type: String, default: null, select: false },
    resetTokenExp:  { type: Date, default: null, select: false },
  },
  { timestamps: true }
)

// Hash password sebelum disimpan
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, BCRYPT_ROUNDS)
  next()
})

// Method cek password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

// Jangan tampilkan password di output
UserSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  delete obj.resetToken
  delete obj.resetTokenExp
  return obj
}

module.exports = mongoose.model('User', UserSchema)