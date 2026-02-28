const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')

const { NODE_ENV } = require('./src/config/env')
const { errorHandler } = require('./src/middlewares/error.middleware')
const { apiLimiter } = require('./src/middlewares/rateLimit.middleware')

const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')

const app = express()


// ================= SECURITY =================

app.use(helmet())


// ================= CORS (FIX Railway) =================

app.use(cors({
  origin: true,
  credentials: true
}))


// ================= BODY PARSER =================

app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))


// ================= SANITIZE =================

app.use(mongoSanitize())
app.use(xss())
app.use(hpp({
  whitelist: ['sort', 'fields', 'page', 'limit', 'category', 'tag']
}))


// ================= LOGGER =================

if (NODE_ENV === 'development') {

  app.use(morgan('dev'))

}


// ================= RATE LIMIT =================

app.use('/api', apiLimiter)


// ================= HEALTH CHECK (WAJIB BUAT RAILWAY) =================

app.get('/', (req, res) => {

  res.status(200).send('🚀 API LIVE')

})

app.get('/api/health', (req, res) => {

  res.status(200).json({
    status: 'ok',
    env: NODE_ENV
  })

})


// ================= API ROUTES =================

app.use('/api/auth',        require('./src/routes/auth.routes'))
app.use('/api/posts',       require('./src/routes/post.routes'))
app.use('/api/categories',  require('./src/routes/category.routes'))
app.use('/api/tags',        require('./src/routes/tag.routes'))
app.use('/api/comments',    require('./src/routes/comment.routes'))
app.use('/api/subscribers', require('./src/routes/subscriber.routes'))
app.use('/api/analytics',   require('./src/routes/analytic.routes'))


// ================= NOT FOUND =================

app.use((req, res) => {

  res.status(404).json({

    message: "Route not found"

  })

})


// ================= ERROR HANDLER =================

app.use(errorHandler)


// ================= EXPORT =================

module.exports = app
