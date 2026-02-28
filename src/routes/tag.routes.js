const express = require('express')
const router = express.Router()
const { getTags, createTag, updateTag, deleteTag } = require('../controllers/tag.controller')
const { protect, adminOnly } = require('../middlewares/auth.middleware')
const validate = require('../middlewares/validate.middleware')
const { body } = require('express-validator')

const tagValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Tag name is required')
    .isLength({ min: 2, max: 30 }).withMessage('Tag name must be 2-30 characters'),
]

// Public
router.get('/', getTags)

// Private
router.post('/',    protect, adminOnly, tagValidator, validate, createTag)
router.put('/:id',  protect, adminOnly, tagValidator, validate, updateTag)
router.delete('/:id', protect, adminOnly, deleteTag)

module.exports = router