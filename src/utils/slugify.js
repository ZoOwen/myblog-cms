const slugifyLib = require('slugify')

const generateSlug = (title) => {
  return slugifyLib(title, {
    lower: true,
    strict: true,
    trim: true,
  })
}

// Tambahin random suffix biar slug unik
const generateUniqueSlug = (title) => {
  const base = generateSlug(title)
  const suffix = Math.random().toString(36).substring(2, 7)
  return `${base}-${suffix}`
}

module.exports = { generateSlug, generateUniqueSlug }