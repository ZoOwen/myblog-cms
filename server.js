require('dotenv').config()
const app = require('./app')
const connectDB = require('./src/config/db')

const PORT = process.env.PORT || 3000
const start = async () => {
  try {
    // Konek DB dulu baru nyalain server
    await connectDB()

    app.listen(PORT, () => {
      console.log('================================')
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📡 ENV: ${process.env.NODE_ENV}`)
      console.log(`🔗 http://localhost:${PORT}/api/health`)
      console.log('================================')
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error.message)
    process.exit(1)
  }
}

start() 
