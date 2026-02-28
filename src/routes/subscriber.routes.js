const express = require('express')
const router  = express.Router()
const { protect, adminOnly } = require('../middlewares/auth.middleware')
const { strictLimiter } = require('../middlewares/rateLimit.middleware')
const {
  subscribe,
  confirm,
  unsubscribe,
  getAll,
  deleteSubscriber,
} = require('../controllers/subscriber.controller')

// Public
router.post('/',                  strictLimiter, subscribe)
router.get('/confirm/:token',     confirm)
router.post('/unsubscribe',       strictLimiter, unsubscribe)

// Admin
router.get('/',                   protect, adminOnly, getAll)
router.delete('/:id',             protect, adminOnly, deleteSubscriber)

module.exports = router