const Analytic = require('../models/Analytic.model')
const Post = require('../models/Post.model')
const User = require('../models/User.model')
const Comment = require('../models/Comment.model')
const Subscriber = require('../models/Subscriber.model')
const { success, error } = require('../utils/response')

// @desc    Get dashboard stats
// @route   GET /api/analytics/dashboard
// @access  Private (admin)
const getDashboardStats = async (req, res, next) => {
  try {
    // Hitung semua stats sekaligus pake Promise.all
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      totalComments,
      pendingComments,
      totalSubscribers,
      confirmedSubscribers,
      totalUsers,
      totalViews,
    ] = await Promise.all([
      Post.countDocuments(),
      Post.countDocuments({ status: 'published' }),
      Post.countDocuments({ status: 'draft' }),
      Comment.countDocuments(),
      Comment.countDocuments({ status: 'pending' }),
      Subscriber.countDocuments(),
      Subscriber.countDocuments({ isConfirmed: true }),
      User.countDocuments(),
      Post.aggregate([
        { $group: { _id: null, total: { $sum: '$stats.views' } } }
      ]),
    ])

    // Top 5 most viewed posts
    const topPosts = await Post.find({ status: 'published' })
      .select('title slug stats.views stats.likes publishedAt')
      .sort({ 'stats.views': -1 })
      .limit(5)

    // Post per bulan (6 bulan terakhir)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const postsPerMonth = await Post.aggregate([
      {
        $match: {
          publishedAt: { $gte: sixMonthsAgo },
          status: 'published',
        }
      },
      {
        $group: {
          _id: {
            year:  { $year: '$publishedAt' },
            month: { $month: '$publishedAt' },
          },
          count: { $sum: 1 },
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ])

    // Views per hari (7 hari terakhir)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const viewsPerDay = await Analytic.aggregate([
      { $match: { viewedAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            year:  { $year: '$viewedAt' },
            month: { $month: '$viewedAt' },
            day:   { $dayOfMonth: '$viewedAt' },
          },
          count: { $sum: 1 },
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ])

    return success(res, {
      overview: {
        posts: {
          total:     totalPosts,
          published: publishedPosts,
          draft:     draftPosts,
        },
        comments: {
          total:   totalComments,
          pending: pendingComments,
        },
        subscribers: {
          total:     totalSubscribers,
          confirmed: confirmedSubscribers,
        },
        users:      totalUsers,
        totalViews: totalViews[0]?.total || 0,
      },
      topPosts,
      postsPerMonth,
      viewsPerDay,
    }, 'Dashboard stats fetched')
  } catch (err) {
    next(err)
  }
}

// @desc    Get views by post
// @route   GET /api/analytics/posts/:postId
// @access  Private (admin)
const getPostAnalytics = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId)
    if (!post) return error(res, 'Post not found', 404)

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Views per hari 30 hari terakhir
    const viewsPerDay = await Analytic.aggregate([
      {
        $match: {
          post:     post._id,
          viewedAt: { $gte: thirtyDaysAgo },
        }
      },
      {
        $group: {
          _id: {
            year:  { $year: '$viewedAt' },
            month: { $month: '$viewedAt' },
            day:   { $dayOfMonth: '$viewedAt' },
          },
          count: { $sum: 1 },
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ])

    // Top referrers
    const topReferrers = await Analytic.aggregate([
      {
        $match: {
          post:     post._id,
          referrer: { $ne: '' },
        }
      },
      {
        $group: {
          _id:   '$referrer',
          count: { $sum: 1 },
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ])

    return success(res, {
      post: {
        title:    post.title,
        slug:     post.slug,
        views:    post.stats.views,
        likes:    post.stats.likes,
        readTime: post.stats.readTime,
      },
      viewsPerDay,
      topReferrers,
    }, 'Post analytics fetched')
  } catch (err) {
    next(err)
  }
}

module.exports = { getDashboardStats, getPostAnalytics }