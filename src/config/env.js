require('dotenv').config()

module.exports = {
  NODE_ENV:             process.env.NODE_ENV || 'development',
  PORT:                 process.env.PORT || 5000,
  MONGO_URI:            process.env.MONGO_URI,
  JWT_SECRET:           process.env.JWT_SECRET,
  JWT_EXPIRES_IN:       process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_SECRET:   process.env.JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  BCRYPT_ROUNDS:        parseInt(process.env.BCRYPT_ROUNDS) || 12,
  IS_PROD:              process.env.NODE_ENV === 'production',
}