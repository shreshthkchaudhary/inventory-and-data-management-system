function errorHandler(err, req, res, next) {
  console.error(err.message);


  if (err.code === 11000) {
    return res.status(409).json({ message: 'A product with this SKU already exists' });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((item) => item.message);
    return res.status(400).json({ message: 'Validation failed', errors: messages });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid value supplied' });
  }

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    message: statusCode === 500 ? 'Internal server error' : err.message
  });
}

module.exports = errorHandler;
