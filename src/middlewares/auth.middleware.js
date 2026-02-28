const jwt = require('jsonwebtoken')
const User = require('../models/User.model') 
const { JWT_SECRET } = require('../config/env')
const { error } = require('../utils/response')

// Cek apakah user udah login
const protect = async (req, res, next) => {
  try {
    let token

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return error(res, 'Not authorized, no token', 401)
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = await User.findById(decoded.id).select('-password')

    if (!req.user) {
      return error(res, 'User not found', 401)
    }

    if (!req.user.isActive) {
      return error(res, 'Account is deactivated', 401)
    }

    next()
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return error(res, 'Invalid token', 401)
    }
    if (err.name === 'TokenExpiredError') {
      return error(res, 'Token expired', 401)
    }
    return error(res, 'Not authorized', 401)
  }
}

// Cek role (admin only)
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return error(res, 'Access denied, admin only', 403)
  }
  next()
}

// Cek role (admin atau author)
const authorOrAdmin = (req, res, next) => {
  if (!['admin', 'author'].includes(req.user?.role)) {
    return error(res, 'Access denied', 403)
  }
  next()
}

module.exports = { protect, adminOnly, authorOrAdmin }