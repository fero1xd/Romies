const rateLimit = require('express-rate-limit');

exports.authLimiter = rateLimit({
  max: 3,
  windowMs: 120 * 60 * 1000,
  message: {
    status: 'error',
    error: {
      message:
        'You recently made too many requests, Please  try again after some time',
    },
  },
});

exports.mainLimiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  error: {
    message: {
      status: 'error',
      message: 'Too many requests',
    },
  },
});
