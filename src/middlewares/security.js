const rateLimit = require('express-rate-limit')
const helmet    = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss       = require('xss-clean')
const hpp       = require('hpp')

// ── General API limit
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 200,
  message: { success: false, message: 'Too many requests, slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// ── Strict limit buat comment & subscriber (paling rawan spam)
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // max 10 request per 15 menit per IP
  message: { success: false, message: 'Too many submissions. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// ── Auth limit (prevent brute force login)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // gak hitung kalau berhasil login
})

module.exports = {
  helmet,
  mongoSanitize,
  xss,
  hpp,
  generalLimiter,
  strictLimiter,
  authLimiter,
}