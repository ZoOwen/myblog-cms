const Subscriber = require('../models/Subscriber.model')
const { success, error } = require('../utils/response')

// @desc    Subscribe to newsletter
// @route   POST /api/subscribers
// @access  Public
const subscribe = async (req, res, next) => {
  try {
    const { email, source } = req.body

    const existingSubscriber = await Subscriber.findOne({ email })
    if (existingSubscriber) {
      if (existingSubscriber.isConfirmed) {
        return error(res, 'Email already subscribed', 400)
      }
      // Resend confirmation if not confirmed
      return success(res, { subscriber: existingSubscriber }, 'Confirmation email resent', 200)
    }

    const subscriber = await Subscriber.create({
      email,
      source: source || 'blog',
    })

    // TODO: Send confirmation email with subscriber.token

    return success(res, { subscriber }, 'Subscription successful. Please check your email to confirm.', 201)
  } catch (err) {
    next(err)
  }
}

// @desc    Confirm subscription
// @route   GET /api/subscribers/confirm/:token
// @access  Public
const confirm = async (req, res, next) => {
  try {
    const { token } = req.params

    const subscriber = await Subscriber.findOne({ token })
    if (!subscriber) {
      return error(res, 'Invalid token', 400)
    }

    if (subscriber.isConfirmed) {
      return error(res, 'Email already confirmed', 400)
    }

    subscriber.isConfirmed = true
    subscriber.confirmedAt = new Date()
    subscriber.token = undefined // Clear token
    await subscriber.save()

    return success(res, { subscriber }, 'Subscription confirmed successfully')
  } catch (err) {
    next(err)
  }
}

// @desc    Unsubscribe
// @route   POST /api/subscribers/unsubscribe
// @access  Public
const unsubscribe = async (req, res, next) => {
  try {
    const { email } = req.body

    const subscriber = await Subscriber.findOne({ email })
    if (!subscriber) {
      return error(res, 'Email not found', 404)
    }

    await Subscriber.findByIdAndDelete(subscriber._id)

    return success(res, null, 'Unsubscribed successfully')
  } catch (err) {
    next(err)
  }
}

// @desc    Get all subscribers
// @route   GET /api/subscribers
// @access  Private (Admin)
const getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const search = req.query.search || ''

    const query = {}
    if (search) {
      query.email = { $regex: search, $options: 'i' }
    }

    const total = await Subscriber.countDocuments(query)
    const subscribers = await Subscriber.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    return success(res, {
      subscribers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    }, 'Subscribers fetched')
  } catch (err) {
    next(err)
  }
}

// @desc    Delete subscriber
// @route   DELETE /api/subscribers/:id
// @access  Private (Admin)
const deleteSubscriber = async (req, res, next) => {
  try {
    const { id } = req.params

    const subscriber = await Subscriber.findById(id)
    if (!subscriber) {
      return error(res, 'Subscriber not found', 404)
    }

    await Subscriber.findByIdAndDelete(id)

    return success(res, null, 'Subscriber deleted successfully')
  } catch (err) {
    next(err)
  }
}

module.exports = {
  subscribe,
  confirm,
  unsubscribe,
  getAll,
  deleteSubscriber,
}
