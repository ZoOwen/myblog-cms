const express = require('express')
const router  = express.Router()
const { protect } = require('../middlewares/auth.middleware')
const { strictLimiter } = require('../middlewares/rateLimit.middleware')
const {
  getCommentsByPost,
  getAllComments,
  createComment,
  updateCommentStatus,
  likeComment,
  deleteComment,
} = require('../controllers/comment.controller')

// Public
router.get('/:postId',     getCommentsByPost)
router.post('/:postId',    strictLimiter, createComment)
router.post('/:id/like',   strictLimiter, likeComment)

// Admin
router.get('/',            protect, getAllComments)
router.put('/:id/status',  protect, updateCommentStatus)
router.delete('/:id',      protect, deleteComment)

module.exports = router