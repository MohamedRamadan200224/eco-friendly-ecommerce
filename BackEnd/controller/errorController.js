const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  // Mongoose 8 duplicate-key errors carry the offending fields in
  // err.keyValue (e.g. { email: 'a@b.c' }). The old code read
  // err.errmsg, which the current driver does not set, and regexed a
  // "matched value" out of it.
  const value = err.keyValue
    ? Object.entries(err.keyValue)
        .map(([key, val]) => `${key}: ${val}`)
        .join(', ')
    : 'duplicate value';

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

// Multer (file upload) errors: without this, an oversize file fell
// through as a generic 500. LIMIT_FILE_SIZE is the only multer error
// this app can hit (the shared instance caps files at 5 MB); anything
// else is reported as a plain 400.
const handleMulterError = (err) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return new AppError('File is too large. Maximum size is 5 MB.', 400);
  }
  return new AppError('File upload failed. Please try again.', 400);
};

const sendErrorDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // B) Non-API request (there is no rendered website in this app):
  // return JSON instead of crashing on res.render('error'), which has no
  // view engine configured.
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // A) Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // B) Programming or other unknown error: don't leak error details
    // 1) Log error
    console.error('ERROR 💥', err);
    // 2) Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }

  // B) Non-API request: this app has no rendered website / view engine,
  // so always answer with JSON. The old code called res.render('error'),
  // which throws because no view engine is configured — turning a 500
  // into a second, unhandled error.
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  console.error('ERROR 💥', err);
  return res.status(500).json({
    status: 'error',
    message: 'Something went very wrong!',
  });
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Convert multer errors before the dev/prod branches: both branches
  // then report the converted (operational) error.
  if (err.name === 'MulterError') err = handleMulterError(err);

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    // The old code did `let error = { ...err }`. Spreading an Error loses
    // its non-enumerable properties — name, message and code — so the
    // CastError / duplicate-key / ValidationError / JWT checks below never
    // matched in production and every error fell through as a generic 500.
    // Copy the error while preserving those properties explicitly.
    const error = Object.create(
      Object.getPrototypeOf(err),
      Object.getOwnPropertyDescriptors(err)
    );
    error.message = err.message;
    error.statusCode = err.statusCode;
    error.status = err.status;
    error.isOperational = err.isOperational;

    let handledError = error;
    if (handledError.name === 'CastError')
      handledError = handleCastErrorDB(handledError);
    if (handledError.code === 11000)
      handledError = handleDuplicateFieldsDB(handledError);
    if (handledError.name === 'ValidationError')
      handledError = handleValidationErrorDB(handledError);
    if (handledError.name === 'JsonWebTokenError')
      handledError = handleJWTError();
    if (handledError.name === 'TokenExpiredError')
      handledError = handleJWTExpiredError();

    sendErrorProd(handledError, req, res);
  } else {
    // NODE_ENV unset / anything else: treat like production (never leak
    // stack traces by default).
    sendErrorProd(err, req, res);
  }
};
