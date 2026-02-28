const Comment = require('../models/Comment.model')
const Post = require('../models/Post.model')
const { success, error, paginated } = require('../utils/response')

// @desc    Get comments by post
// @route   GET /api/comments/:postId
// @access  Public
const getCommentsByPost = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query

    const post = await Post.findById(req.params.postId)
    if (!post) return error(res, 'Post not found', 404)

    const skip  = (Number(page) - 1) * Number(limit)

    // Ambil top-level comments dulu
    const total = await Comment.countDocuments({
      post:   req.params.postId,
      parent: null,
      status: 'approved',
    })

    const topLevel = await Comment.find({
      post:   req.params.postId,
      parent: null,
      status: 'approved',
    })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(Number(limit))

    // Ambil semua replies sekaligus
    const replies = await Comment.find({
      post:   req.params.postId,
      parent: { $in: topLevel.map(c => c._id) },
      status: 'approved',
    }).sort({ createdAt: 1 })

    // Gabungin replies ke parent masing-masing
    const commentsWithReplies = topLevel.map(comment => {
      const commentObj = comment.toObject()
      commentObj.replies = replies.filter(
        r => r.parent.toString() === comment._id.toString()
      )
      return commentObj
    })

    return paginated(res, commentsWithReplies, {
      total,
      page:  Number(page),
      limit: Number(limit),
    })
  } catch (err) {
    next(err)
  }
}

// @desc    Get all comments (admin)
// @route   GET /api/comments
// @access  Private (admin)
const getAllComments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status = 'pending' } = req.query

    const query = {}
    if (status !== 'all') query.status = status

    const skip  = (Number(page) - 1) * Number(limit)
    const total = await Comment.countDocuments(query)

    const comments = await Comment.find(query)
      .populate('post', 'title slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))

    return paginated(res, comments, {
      total,
      page:  Number(page),
      limit: Number(limit),
    })
  } catch (err) {
    next(err)
  }
}

// @desc    Create comment
// @route   POST /api/comments/:postId
// @access  Public
const createComment = async (req, res, next) => {
  try {
    const { name, email, content, parent } = req.body

    const post = await Post.findOne({
      _id:    req.params.postId,
      status: 'published',
    })
    if (!post) return error(res, 'Post not found', 404)

    // Kalau reply, pastiin parent comment ada
    if (parent) {
      const parentComment = await Comment.findById(parent)
      if (!parentComment) return error(res, 'Parent comment not found', 404)
      // Maksimal 1 level reply aja
      if (parentComment.parent) return error(res, 'Cannot reply to a reply', 400)
    }

    const comment = await Comment.create({
      post:    req.params.postId,
      parent:  parent || null,
      author:  { name, email },
      content,
      status:  'pending',
    })

    return success(
      res,
      { comment },
      'Comment submitted, waiting for approval',
      201
    )
  } catch (err) {
    next(err)
  }
}

// @desc    Approve / reject comment
// @route   PUT /api/comments/:id/status
// @access  Private (admin)
const updateCommentStatus = async (req, res, next) => {
  try {
    const { status } = req.body

    if (!['approved', 'rejected'].includes(status)) {
      return error(res, 'Status must be approved or rejected', 400)
    }

    const comment = await Comment.findById(req.params.id)
    if (!comment) return error(res, 'Comment not found', 404)

    comment.status = status
    await comment.save()

    return success(res, { comment }, `Comment ${status}`)
  } catch (err) {
    next(err)
  }
}

// @desc    Like a comment
// @route   POST /api/comments/:id/like
// @access  Public
const likeComment = async (req, res, next) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    )

    if (!comment) return error(res, 'Comment not found', 404)

    return success(res, { likes: comment.likes }, 'Comment liked')
  } catch (err) {
    next(err)
  }
}

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private (admin)
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id)
    if (!comment) return error(res, 'Comment not found', 404)

    // Hapus replies juga kalau top-level comment
    if (!comment.parent) {
      await Comment.deleteMany({ parent: comment._id })
    }

    await comment.deleteOne()

    return success(res, null, 'Comment deleted')
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getCommentsByPost,
  getAllComments,
  createComment,
  updateCommentStatus,
  likeComment,
  deleteComment,
}