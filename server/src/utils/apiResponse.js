export const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data
  });
};

export const errorResponse = (res, message = 'An error occurred', statusCode = 400, errors = null) => {
  return res.status(statusCode).json({
    status: 'error',
    message,
    ...(errors ? { errors } : {})
  });
};
