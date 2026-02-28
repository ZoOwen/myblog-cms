# API Payload Documentation

## Base URL
```
/api
```

---

## Auth Routes (`/api/auth`)

### Public Endpoints

#### 1. POST /api/auth/register
Register a new user.

**Payload:**
```
json
{
  "name": "string (min: 2, max: 50)",
  "email": "string (valid email)",
  "password": "string (min: 6, must contain uppercase, lowercase, number)",
  "role": "optional - 'admin' or 'author'"
}
```

**Example:**
```
json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "role": "author"
}
```

---

#### 2. POST /api/auth/login
Login with existing credentials.

**Payload:**
```
json
{
  "email": "string (valid email)",
  "password": "string"
}
```

**Example:**
```
json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

---

#### 3. POST /api/auth/refresh
Refresh access token.

**Payload:**
```
json
{
  "refreshToken": "string"
}
```

**Example:**
```
json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Private Endpoints (Require Authentication)

#### 4. GET /api/auth/me
Get current user profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Payload:** None

---

#### 5. PUT /api/auth/profile
Update user profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Payload:**
```
json
{
  "name": "optional - string (min: 2, max: 50)",
  "bio": "optional - string (max: 300)",
  "socials": {
    "github": "optional - valid URL",
    "twitter": "optional - valid URL",
    "linkedin": "optional - valid URL"
  }
}
```

**Example:**
```
json
{
  "name": "John Doe",
  "bio": "Software developer and tech writer",
  "socials": {
    "github": "https://github.com/johndoe",
    "twitter": "https://twitter.com/johndoe",
    "linkedin": "https://linkedin.com/in/johndoe"
  }
}
```

---

#### 6. PUT /api/auth/change-password
Change user password.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Payload:**
```
json
{
  "currentPassword": "string",
  "newPassword": "string (min: 6, must contain uppercase, lowercase, number)"
}
```

**Example:**
```
json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword456"
}
```

---

## Post Routes (`/api/posts`)

### Public Endpoints

#### 7. GET /api/posts
Get all posts (with pagination, filtering, sorting).

**Query Parameters:**
```
page, limit, category, tag, author, status, search, sortBy, sortOrder
```

**Payload:** None

---

#### 8. GET /api/posts/featured
Get featured post.

**Payload:** None

---

#### 9. GET /api/posts/:slug
Get post by slug.

**Parameters:**
```
slug: string
```

**Payload:** None

---

#### 10. POST /api/posts/:id/like
Like a post.

**Parameters:**
```
id: string (MongoDB ObjectId)
```

**Payload:** None

---

### Private Endpoints (Require Authentication - Author/Admin)

#### 11. POST /api/posts
Create a new post.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Payload:**
```
json
{
  "title": "string (min: 5, max: 200)",
  "excerpt": "string (min: 10, max: 300)",
  "content": "string (min: 50)",
  "category": "string (MongoDB ObjectId)",
  "tags": "optional - array of MongoDB ObjectId",
  "status": "optional - 'draft', 'published', or 'archived'",
  "isFeatured": "optional - boolean"
}
```

**Example:**
```
json
{
  "title": "Getting Started with Node.js",
  "excerpt": "Learn the basics of Node.js in this comprehensive guide",
  "content": "Node.js is a JavaScript runtime built on Chrome's V8 engine...",
  "category": "507f1f77bcf86cd799439011",
  "tags": ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"],
  "status": "published",
  "isFeatured": false
}
```

---

#### 12. PUT /api/posts/:id
Update a post.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Parameters:**
```
id: string (MongoDB ObjectId)
```

**Payload:**
```json
{
  "title": "optional - string (min: 5, max: 200)",
  "excerpt": "optional - string (min: 10, max: 300)",
  "content": "optional - string (min: 50)",
  "category": "optional - MongoDB ObjectId",
  "status": "optional - 'draft', 'published', or 'archived'"
}
```

**Example:**
```
json
{
  "title": "Updated: Getting Started with Node.js",
  "status": "published"
}
```

---

#### 13. DELETE /api/posts/:id
Delete a post (Admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Parameters:**
```
id: string (MongoDB ObjectId)
```

**Payload:** None

---

## Category Routes (`/api/categories`)

### Public Endpoints

#### 14. GET /api/categories
Get all categories.

**Payload:** None

---

#### 15. GET /api/categories/:slug
Get category by slug.

**Parameters:**
```
slug: string
```

**Payload:** None

---

### Private Endpoints (Require Authentication - Admin Only)

#### 16. POST /api/categories
Create a new category.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Payload:**
```
json
{
  "name": "string (min: 2, max: 50)",
  "description": "optional - string (max: 200)",
  "color": "optional - hex color (#RRGGBB or #RGB)"
}
```

**Example:**
```
json
{
  "name": "Technology",
  "description": "Posts about technology and gadgets",
  "color": "#3498db"
}
```

---

#### 17. PUT /api/categories/:id
Update a category.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Parameters:**
```
id: string (MongoDB ObjectId)
```

**Payload:**
```
json
{
  "name": "optional - string (min: 2, max: 50)",
  "description": "optional - string (max: 200)",
  "color": "optional - hex color"
}
```

**Example:**
```
json
{
  "name": "Tech",
  "color": "#e74c3c"
}
```

---

#### 18. DELETE /api/categories/:id
Delete a category.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Parameters:**
```
id: string (MongoDB ObjectId)
```

**Payload:** None

---

## Tag Routes (`/api/tags`)

### Public Endpoints

#### 19. GET /api/tags
Get all tags.

**Payload:** None

---

### Private Endpoints (Require Authentication - Admin Only)

#### 20. POST /api/tags
Create a new tag.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Payload:**
```
json
{
  "name": "string (min: 2, max: 30)"
}
```

**Example:**
```
json
{
  "name": "JavaScript"
}
```

---

#### 21. PUT /api/tags/:id
Update a tag.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Parameters:**
```
id: string (MongoDB ObjectId)
```

**Payload:**
```
json
{
  "name": "string (min: 2, max: 30)"
}
```

**Example:**
```
json
{
  "name": "NodeJS"
}
```

---

#### 22. DELETE /api/tags/:id
Delete a tag.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Parameters:**
```
id: string (MongoDB ObjectId)
```

**Payload:** None

---

## Comment Routes (`/api/comments`)

### Public Endpoints

#### 23. GET /api/comments/:postId
Get comments by post.

**Parameters:**
```
postId: string (MongoDB ObjectId)
```

**Payload:** None

---

#### 24. POST /api/comments/:postId
Create a comment on a post.

**Payload:**
```
json
{
  "name": "string (min: 2, max: 50)",
  "email": "string (valid email)",
  "content": "string (min: 2, max: 2000)",
  "parent": "optional - MongoDB ObjectId (parent comment ID)"
}
```

**Example:**
```
json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "content": "Great article! Very informative.",
  "parent": "507f1f77bcf86cd799439011"
}
```

---

#### 25. POST /api/comments/:id/like
Like a comment.

**Parameters:**
```
id: string (MongoDB ObjectId)
```

**Payload:** None

---

### Private Endpoints (Require Authentication - Admin Only)

#### 26. GET /api/comments
Get all comments (Admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Payload:** None

---

#### 27. PUT /api/comments/:id/status
Update comment status (approve/reject).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Parameters:**
```
id: string (MongoDB ObjectId)
```

**Payload:**
```
json
{
  "status": "string ('approved' or 'rejected')"
}
```

**Example:**
```
json
{
  "status": "approved"
}
```

---

#### 28. DELETE /api/comments/:id
Delete a comment.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Parameters:**
```
id: string (MongoDB ObjectId)
```

**Payload:** None

---

## Subscriber Routes (`/api/subscribers`)

### Public Endpoints

#### 29. POST /api/subscribers
Subscribe to newsletter.

**Payload:**
```
json
{
  "email": "string (valid email)"
}
```

**Example:**
```
json
{
  "email": "subscriber@example.com"
}
```

---

#### 30. GET /api/subscribers/confirm/:token
Confirm subscription.

**Parameters:**
```
token: string
```

**Payload:** None

---

#### 31. POST /api/subscribers/unsubscribe
Unsubscribe from newsletter.

**Payload:**
```
json
{
  "email": "string (valid email)"
}
```

**Example:**
```
json
{
  "email": "subscriber@example.com"
}
```

---

### Private Endpoints (Require Authentication - Admin Only)

#### 32. GET /api/subscribers
Get all subscribers.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Payload:** None

---

#### 33. DELETE /api/subscribers/:id
Delete a subscriber.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Parameters:**
```
id: string (MongoDB ObjectId)
```

**Payload:** None

---

## Health Check

#### 34. GET /api/health
Server health check.

**Payload:** None
