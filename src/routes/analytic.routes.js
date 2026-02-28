const express = require('express')
const router = express.Router()
const {
  getDashboardStats,
  getPostAnalytics,
} = require('../controllers/analytic.controller')
const { protect, adminOnly } = require('../middlewares/auth.middleware')

router.get('/dashboard',       protect, adminOnly, getDashboardStats)
router.get('/posts/:postId',   protect, adminOnly, getPostAnalytics)

module.exports = router