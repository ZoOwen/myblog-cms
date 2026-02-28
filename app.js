const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const { NODE_ENV } = require('./src/config/env')
const { errorHandler } = require('./src/middlewares/error.middleware')
const { apiLimiter } = require('./src/middlewares/rateLimit.middleware')

const app = express()

// ── Security
app.use(helmet())

// ── CORS
app.use(cors({
  origin: NODE_ENV === 'production'
    ? ['https://yourdomain.com']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}))

// ── Body Parser
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ── Logger
if (NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// ── Rate Limiter
app.use('/api', apiLimiter)

// ── Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status:    'success',
    message:   'Server is running 🟢',
    env:       NODE_ENV,
    timestamp: new Date().toISOString(),
  })
})

// ── Routes
app.use('/api/auth',        require('./src/routes/auth.routes'))
app.use('/api/posts',       require('./src/routes/post.routes'))
app.use('/api/categories',  require('./src/routes/category.routes'))
app.use('/api/tags',        require('./src/routes/tag.routes'))
app.use('/api/comments',    require('./src/routes/comment.routes'))
app.use('/api/subscribers', require('./src/routes/subscriber.routes'))
app.use('/api/analytics',   require('./src/routes/analytic.routes'))

// ── 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status:  'error',
    message: `Route ${req.method} ${req.originalUrl} not found`,
  })
})

// ── Global Error Handler
app.use(errorHandler)

module.exports = app