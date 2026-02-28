const Tag = require('../models/Tag.model')
const { success, error } = require('../utils/response')
const { generateSlug } = require('../utils/slugify')

// @desc    Get all tags
// @route   GET /api/tags
// @access  Public
const getTags = async (req, res, next) => {
  try {
    const tags = await Tag.find().sort({ name: 1 })
    return success(res, { tags }, 'Tags fetched')
  } catch (err) {
    next(err)
  }
}

// @desc    Create tag
// @route   POST /api/tags
// @access  Private (admin only)
const createTag = async (req, res, next) => {
  try {
    const { name } = req.body

    const slug = generateSlug(name)

    const existing = await Tag.findOne({ slug })
    if (existing) return error(res, 'Tag already exists', 400)

    const tag = await Tag.create({ name, slug })
    return success(res, { tag }, 'Tag created', 201)
  } catch (err) {
    next(err)
  }
}

// @desc    Update tag
// @route   PUT /api/tags/:id
// @access  Private (admin only)
const updateTag = async (req, res, next) => {
  try {
    const { name } = req.body

    const tag = await Tag.findById(req.params.id)
    if (!tag) return error(res, 'Tag not found', 404)

    const slug = generateSlug(name)

    const updated = await Tag.findByIdAndUpdate(
      req.params.id,
      { name, slug },
      { new: true, runValidators: true }
    )

    return success(res, { tag: updated }, 'Tag updated')
  } catch (err) {
    next(err)
  }
}

// @desc    Delete tag
// @route   DELETE /api/tags/:id
// @access  Private (admin only)
const deleteTag = async (req, res, next) => {
  try {
    const tag = await Tag.findById(req.params.id)
    if (!tag) return error(res, 'Tag not found', 404)

    await tag.deleteOne()
    return success(res, null, 'Tag deleted')
  } catch (err) {
    next(err)
  }
}

module.exports = { getTags, createTag, updateTag, deleteTag }