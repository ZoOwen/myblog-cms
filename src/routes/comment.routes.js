const express = require('express')
const router = express.Router()
const {
  getCommentsByPost,
  getAllComments,
  createComment,
  updateCommentStatus,
  likeComment,
  deleteComment,
} = require('../controllers/comment.controller')
const { protect, adminOnly } = require('../middlewares/auth.middleware')
const validate = require('../middlewares/validate.middleware')
const { commentValidator } = require('../validators/comment.validator')

// Public
router.get('/:postId',        getCommentsByPost)
router.post('/:postId',       commentValidator, validate, createComment)
router.post('/:id/like',      likeComment)

// Private (admin)
router.get('/',               protect, adminOnly, getAllComments)
router.put('/:id/status',     protect, adminOnly, updateCommentStatus)
router.delete('/:id',         protect, adminOnly, deleteComment)

module.exports = router