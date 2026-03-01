const express = require('express')
const router  = express.Router()
const { protect } = require('../middlewares/auth.middleware')  
const { authLimiter } = require('../middlewares/security')
const {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  changePassword,
} = require('../controllers/auth.controller')

// Auth routes dengan brute force protection
// router.post('/register', authLimiter, register)
router.post('/login',    authLimiter, login)
router.post('/refresh',  refreshToken)
router.post('/logout',   protect, logout)
router.get('/me',        protect, getMe)
router.put('/profile',   protect, updateProfile)
router.put('/password',  protect, changePassword)

module.exports = router
