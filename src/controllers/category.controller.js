const Category = require('../models/Category.model')
const { success, error } = require('../utils/response')
const { generateSlug } = require('../utils/slugify')

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 })
    return success(res, { categories }, 'Categories fetched')
  } catch (err) {
    next(err)
  }
}

// @desc    Get single category by slug
// @route   GET /api/categories/:slug
// @access  Public
const getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug })
    if (!category) return error(res, 'Category not found', 404)
    return success(res, { category }, 'Category fetched')
  } catch (err) {
    next(err)
  }
}

// @desc    Create category
// @route   POST /api/categories
// @access  Private (admin only)
const createCategory = async (req, res, next) => {
  try {
    const { name, description, color } = req.body

    const slug = generateSlug(name)

    const existing = await Category.findOne({ slug })
    if (existing) return error(res, 'Category already exists', 400)

    const category = await Category.create({ name, slug, description, color })
    return success(res, { category }, 'Category created', 201)
  } catch (err) {
    next(err)
  }
}

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (admin only)
const updateCategory = async (req, res, next) => {
  try {
    const { name, description, color } = req.body

    const category = await Category.findById(req.params.id)
    if (!category) return error(res, 'Category not found', 404)

    if (name && name !== category.name) {
      req.body.slug = generateSlug(name)
    }

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { name, slug: req.body.slug, description, color },
      { new: true, runValidators: true }
    )

    return success(res, { category: updated }, 'Category updated')
  } catch (err) {
    next(err)
  }
}

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (admin only)
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id)
    if (!category) return error(res, 'Category not found', 404)

    await category.deleteOne()
    return success(res, null, 'Category deleted')
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
}