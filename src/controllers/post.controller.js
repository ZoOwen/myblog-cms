const Post = require('../models/Post.model')
const Category = require('../models/Category.model')
const Tag = require('../models/Tag.model')
const Analytic = require('../models/Analytic.model')
const { success, error, paginated } = require('../utils/response')
const { generateSlug, generateUniqueSlug } = require('../utils/slugify')

// @desc    Get all published posts
// @route   GET /api/posts
// @access  Public
const getPosts = async (req, res, next) => {
  try {
    const {
      page     = 1,
      limit    = 10,
      category,
      tag,
      search,
      status   = 'published',
    } = req.query

    const query = {}

    // Admin bisa liat semua status, public cuma published
    if (req.user?.role === 'admin') {
      if (status !== 'all') query.status = status
    } else {
      query.status = 'published'
    }

    // Filter category
    if (category) query.category = category

    // Filter tag
    if (tag) query.tags = tag

    // Search
    if (search) {
      query.$text = { $search: search }
    }

    const skip  = (Number(page) - 1) * Number(limit)
    const total = await Post.countDocuments(query)

    const posts = await Post.find(query)
      .populate('author',   'name avatar')
      .populate('category', 'name slug color')
      .populate('tags',     'name slug')
      .sort({ isPinned: -1, publishedAt: -1 })
      .skip(skip)
      .limit(Number(limit))

    return paginated(res, posts, {
      total,
      page:  Number(page),
      limit: Number(limit),
    })
  } catch (err) {
    next(err)
  }
}

// @desc    Get single post by slug
// @route   GET /api/posts/:slug
// @access  Public
const getPostBySlug = async (req, res, next) => {
  try {
    const post = await Post.findOne({
      slug:   req.params.slug,
      status: 'published',
    })
      .populate('author',   'name avatar bio socials')
      .populate('category', 'name slug color')
      .populate('tags',     'name slug')

    if (!post) {
      return error(res, 'Post not found', 404)
    }

    // Catat view di analytics
    await Analytic.create({
      post:      post._id,
      ip:        req.ip,
      userAgent: req.headers['user-agent'] || '',
      referrer:  req.headers['referer'] || '',
    })

    // Increment view count
    await Post.findByIdAndUpdate(post._id, {
      $inc: { 'stats.views': 1 }
    })

    return success(res, { post }, 'Post fetched')
  } catch (err) {
    next(err)
  }
}

// @desc    Get featured post
// @route   GET /api/posts/featured
// @access  Public
const getFeaturedPost = async (req, res, next) => {
  try {
    const post = await Post.findOne({ isFeatured: true, status: 'published' })
      .populate('author',   'name avatar')
      .populate('category', 'name slug color')
      .populate('tags',     'name slug')

    if (!post) {
      return error(res, 'No featured post found', 404)
    }

    return success(res, { post }, 'Featured post fetched')
  } catch (err) {
    next(err)
  }
}

// @desc    Create post
// @route   POST /api/posts
// @access  Private (admin, author)
const createPost = async (req, res, next) => {
  try {
    const {
      title, excerpt, content,
      category, tags, thumbnail,
      status, isFeatured, isPinned, seo,
    } = req.body

    // Generate slug dari title
    let slug = generateSlug(title)

    // Cek slug udah ada belum
    const existingSlug = await Post.findOne({ slug })
    if (existingSlug) {
      slug = generateUniqueSlug(title)
    }

    // Hitung estimasi read time (rata-rata 200 kata/menit)
    const wordCount = content.trim().split(/\s+/).length
    const readTime  = Math.ceil(wordCount / 200)

    const post = await Post.create({
      title,
      slug,
      excerpt,
      content,
      author:     req.user._id,
      category,
      tags:       tags || [],
      thumbnail,
      status:     status || 'draft',
      isFeatured: isFeatured || false,
      isPinned:   isPinned || false,
      seo:        seo || {},
      'stats.readTime': readTime,
    })

    // Update postCount di category
    await Category.findByIdAndUpdate(category, { $inc: { postCount: 1 } })

    // Update postCount di tags
    if (tags?.length) {
      await Tag.updateMany(
        { _id: { $in: tags } },
        { $inc: { postCount: 1 } }
      )
    }

    const populated = await post.populate([
      { path: 'author',   select: 'name avatar' },
      { path: 'category', select: 'name slug color' },
      { path: 'tags',     select: 'name slug' },
    ])

    return success(res, { post: populated }, 'Post created', 201)
  } catch (err) {
    next(err)
  }
}

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private (admin, author)
const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return error(res, 'Post not found', 404)
    }

    // Author hanya bisa edit post miliknya sendiri
    if (req.user.role !== 'admin' && post.author.toString() !== req.user._id.toString()) {
      return error(res, 'Not authorized to edit this post', 403)
    }

    // Kalau title berubah, update slug juga
    if (req.body.title && req.body.title !== post.title) {
      let newSlug = generateSlug(req.body.title)
      const existingSlug = await Post.findOne({ slug: newSlug, _id: { $ne: post._id } })
      if (existingSlug) newSlug = generateUniqueSlug(req.body.title)
      req.body.slug = newSlug
    }

    // Update readTime kalau content berubah
    if (req.body.content) {
      const wordCount = req.body.content.trim().split(/\s+/).length
      req.body['stats.readTime'] = Math.ceil(wordCount / 200)
    }

    const updated = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'author',   select: 'name avatar' },
      { path: 'category', select: 'name slug color' },
      { path: 'tags',     select: 'name slug' },
    ])

    return success(res, { post: updated }, 'Post updated')
  } catch (err) {
    next(err)
  }
}

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private (admin only)
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return error(res, 'Post not found', 404)
    }

    // Decrement postCount di category & tags
    await Category.findByIdAndUpdate(post.category, { $inc: { postCount: -1 } })
    if (post.tags?.length) {
      await Tag.updateMany(
        { _id: { $in: post.tags } },
        { $inc: { postCount: -1 } }
      )
    }

    await post.deleteOne()

    return success(res, null, 'Post deleted')
  } catch (err) {
    next(err)
  }
}

// @desc    Like a post
// @route   POST /api/posts/:id/like
// @access  Public
const likePost = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { 'stats.likes': 1 } },
      { new: true }
    )

    if (!post) {
      return error(res, 'Post not found', 404)
    }

    return success(res, { likes: post.stats.likes }, 'Post liked')
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getPosts,
  getPostBySlug,
  getFeaturedPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
}