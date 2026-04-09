import ErrorResponse from '../utils/errorResponse.js';

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.log(err.stack);

  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }

  if (err.name === 'SequelizeValidationError') {
    const message = err.errors.map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    const detail = err.parent ? err.parent.sqlMessage : err.message;
    const message = `Invalid reference value: ${detail}`;
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || err.message || 'Server Error'
  });
};

export default errorHandler;
