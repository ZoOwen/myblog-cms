const express = require('express')
const router = express.Router()
const {
  register,
  login,
  getMe,
  refreshToken,
  updateProfile,
  changePassword,
} = require('../controllers/auth.controller')
const { protect } = require('../middlewares/auth.middleware')
const validate = require('../middlewares/validate.middleware')
const { authLimiter } = require('../middlewares/rateLimit.middleware')
const {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
} = require('../validators/auth.validator')

// Public
router.post('/register', authLimiter, registerValidator, validate, register)
router.post('/login',    authLimiter, loginValidator,    validate, login)
router.post('/refresh',  refreshToken)

// Private
router.get('/me',                protect, getMe)
router.put('/profile',           protect, updateProfileValidator, validate, updateProfile)
router.put('/change-password',   protect, changePasswordValidator, validate, changePassword)

module.exports = router