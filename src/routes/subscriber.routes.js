const express = require('express')
const router = express.Router()
const {
  subscribe,
  confirm,
  unsubscribe,
  getAll,
  deleteSubscriber,
} = require('../controllers/subscriber.controller')
const { protect,adminOnly } = require('../middlewares/auth.middleware')
const validate = require('../middlewares/validate.middleware')
const {
  subscribeValidator,
  confirmValidator,
  unsubscribeValidator,
} = require('../validators/subscriber.validator')

// Public
router.post('/',      subscribeValidator, validate, subscribe)
router.get('/confirm/:token', confirmValidator, validate, confirm)
router.post('/unsubscribe', unsubscribeValidator, validate, unsubscribe)

// Private (Admin)
router.get('/',               protect,adminOnly, getAll)
router.delete('/:id',         protect,adminOnly, deleteSubscriber)

module.exports = router
