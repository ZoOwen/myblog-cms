const { body } = require('express-validator')

const createPostValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),

  body('excerpt')
    .trim()
    .notEmpty().withMessage('Excerpt is required')
    .isLength({ min: 10, max: 300 }).withMessage('Excerpt must be 10-300 characters'),

  body('content')
    .trim()
    .notEmpty().withMessage('Content is required')
    .isLength({ min: 50 }).withMessage('Content minimum 50 characters'),

  body('category')
    .notEmpty().withMessage('Category is required')
    .isMongoId().withMessage('Invalid category ID'),

  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),

  body('tags.*')
    .optional()
    .isMongoId().withMessage('Invalid tag ID'),

  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived']).withMessage('Invalid status'),

  body('isFeatured')
    .optional()
    .isBoolean().withMessage('isFeatured must be boolean'),
]

const updatePostValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),

  body('excerpt')
    .optional()
    .trim()
    .isLength({ min: 10, max: 300 }).withMessage('Excerpt must be 10-300 characters'),

  body('content')
    .optional()
    .trim()
    .isLength({ min: 50 }).withMessage('Content minimum 50 characters'),

  body('category')
    .optional()
    .isMongoId().withMessage('Invalid category ID'),

  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived']).withMessage('Invalid status'),
]

module.exports = { createPostValidator, updatePostValidator }