export const errorHandler = (err, req, res, next) => {
  console.error('🚨 Central Error Handler caught:', err);

  // Handle PostgreSQL GiST exclusion constraint error (Double booking)
  if (err.code === '23P01') {
    return res.status(409).json({
      status: 'error',
      code: 'COURT_DOUBLE_BOOKING',
      message: 'This court slot has already been reserved. Please select another time or court.'
    });
  }

  // Handle unique violation
  if (err.code === '23505') {
    return res.status(409).json({
      status: 'error',
      code: 'DUPLICATE_RESOURCE',
      message: 'Resource with these unique details already exists.'
    });
  }

  // Handle check constraint violation (e.g. negative stock)
  if (err.code === '23514') {
    return res.status(400).json({
      status: 'error',
      code: 'CONSTRAINT_VIOLATION',
      message: 'Operation violates business constraints (e.g., insufficient inventory or invalid quota).'
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
};
