const { body, param } = require('express-validator')

const subscribeValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
]

const confirmValidator = [
  param('token')
    .notEmpty().withMessage('Token is required'),
]

const unsubscribeValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
]

module.exports = {
  subscribeValidator,
  confirmValidator,
  unsubscribeValidator,
}
