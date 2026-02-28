const express = require('express')
const router = express.Router()
const {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/category.controller')
const { protect, adminOnly } = require('../middlewares/auth.middleware')
const validate = require('../middlewares/validate.middleware')
const { categoryValidator } = require('../validators/category.validator')

// Public
router.get('/',      getCategories)
router.get('/:slug', getCategoryBySlug)

// Private
router.post('/',    protect, adminOnly, categoryValidator, validate, createCategory)
router.put('/:id',  protect, adminOnly, categoryValidator, validate, updateCategory)
router.delete('/:id', protect, adminOnly, deleteCategory)

module.exports = router