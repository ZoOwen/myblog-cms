const express = require('express')
const router = express.Router()
const {
  getPosts,
  getPostBySlug,
  getFeaturedPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
} = require('../controllers/post.controller')
const { protect, adminOnly, authorOrAdmin } = require('../middlewares/auth.middleware')
const validate = require('../middlewares/validate.middleware')
const { createPostValidator, updatePostValidator } = require('../validators/post.validator')

// Public
router.get('/',           getPosts)
router.get('/featured',   getFeaturedPost)
router.get('/:slug',      getPostBySlug)
router.post('/:id/like',  likePost)

// Private
router.post('/',    protect, authorOrAdmin, createPostValidator, validate, createPost)
router.put('/:id',  protect, authorOrAdmin, updatePostValidator, validate, updatePost)
router.delete('/:id', protect, adminOnly, deletePost)

module.exports = router