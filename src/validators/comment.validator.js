const { body } = require('express-validator')

const commentValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),

  body('content')
    .trim()
    .notEmpty().withMessage('Comment is required')
    .isLength({ min: 2, max: 2000 }).withMessage('Comment must be 2-2000 characters'),

  body('parent')
    .optional()
    .isMongoId().withMessage('Invalid parent comment ID'),
]

module.exports = { commentValidator }