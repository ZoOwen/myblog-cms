const success = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data,
  })
}

const error = (res, message = 'Something went wrong', statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    status: 'error',
    message,
    ...(errors && { errors }),
  })
}

const paginated = (res, data, pagination) => {
  return res.status(200).json({
    status: 'success',
    data,
    pagination: {
      total:       pagination.total,
      page:        pagination.page,
      limit:       pagination.limit,
      totalPages:  Math.ceil(pagination.total / pagination.limit),
      hasNextPage: pagination.page < Math.ceil(pagination.total / pagination.limit),
      hasPrevPage: pagination.page > 1,
    },
  })
}

module.exports = { success, error, paginated }