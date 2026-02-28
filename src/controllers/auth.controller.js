const jwt = require('jsonwebtoken')
const User = require('../models/User.model')
const { success, error } = require('../utils/response')
const {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN,
} = require('../config/env')

// Generate tokens
const generateTokens = (id) => {
  const accessToken = jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
  const refreshToken = jwt.sign({ id }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN })
  return { accessToken, refreshToken }
}

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return error(res, 'Email already registered', 400)
    }

    const user = await User.create({ name, email, password, role })
    const { accessToken, refreshToken } = generateTokens(user._id)

    return success(res, {
      user,
      accessToken,
      refreshToken,
    }, 'Register successful', 201)
  } catch (err) {
    next(err)
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return error(res, 'Invalid credentials', 401)
    }

    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return error(res, 'Invalid credentials', 401)
    }

    if (!user.isActive) {
      return error(res, 'Account is deactivated', 401)
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save({ validateBeforeSave: false })

    const { accessToken, refreshToken } = generateTokens(user._id)

    return success(res, {
      user,
      accessToken,
      refreshToken,
    }, 'Login successful')
  } catch (err) {
    next(err)
  }
}

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    return success(res, { user }, 'User fetched')
  } catch (err) {
    next(err)
  }
}

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body

    if (!token) {
      return error(res, 'Refresh token required', 400)
    }

    const decoded = jwt.verify(token, JWT_REFRESH_SECRET)
    const user = await User.findById(decoded.id)

    if (!user) {
      return error(res, 'User not found', 401)
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id)

    return success(res, {
      accessToken,
      refreshToken: newRefreshToken,
    }, 'Token refreshed')
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return error(res, 'Refresh token expired, please login again', 401)
    }
    next(err)
  }
}

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, avatar, socials } = req.body

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, avatar, socials },
      { new: true, runValidators: true }
    )

    return success(res, { user }, 'Profile updated')
  } catch (err) {
    next(err)
  }
}

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await User.findById(req.user._id).select('+password')

    const isMatch = await user.matchPassword(currentPassword)
    if (!isMatch) {
      return error(res, 'Current password is incorrect', 400)
    }

    user.password = newPassword
    await user.save()

    const { accessToken, refreshToken } = generateTokens(user._id)

    return success(res, { accessToken, refreshToken }, 'Password changed successfully')
  } catch (err) {
    next(err)
  }
}
// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    // Kalau mau blacklist token, bisa simpan ke Redis/DB di sini
    // Untuk sekarang cukup return success — client yang hapus token
    return success(res, null, 'Logged out successfully')
  } catch (err) {
    next(err)
  }
}
module.exports = {
  register,
  login,
  getMe,
  refreshToken,
  updateProfile,
  changePassword,
  logout,
}