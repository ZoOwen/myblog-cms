const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema(
  {
    title:     { type: String, required: true, trim: true },
    slug:      { type: String, required: true, unique: true },
    excerpt:   { type: String, required: true, maxlength: 300 },
    content:   { type: String, required: true },
    author:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true },
    category:  { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    tags:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    thumbnail: { type: String, default: null },
    images:    [{ type: String }],
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    isFeatured:  { type: Boolean, default: false },
    isPinned:    { type: Boolean, default: false },
    seo: {
      metaTitle:       { type: String, default: '' },
      metaDescription: { type: String, default: '' },
      ogImage:         { type: String, default: null },
      keywords:        [{ type: String }],
    },
    stats: {
      views:    { type: Number, default: 0 },
      likes:    { type: Number, default: 0 },
      readTime: { type: Number, default: 0 },
    },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

// Index
PostSchema.index({ slug: 1 })
PostSchema.index({ status: 1, publishedAt: -1 })
PostSchema.index({ category: 1, status: 1 })
PostSchema.index({ tags: 1 })
PostSchema.index({ isFeatured: 1, status: 1 })
PostSchema.index({ title: 'text', excerpt: 'text' })

// Auto set publishedAt saat status jadi published
PostSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date()
  }
  next()
})

module.exports = mongoose.model('Post', PostSchema)