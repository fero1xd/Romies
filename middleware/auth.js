const User = require('../models/userSchema');

const sendError = (res, msg, code) => {
  res.status(code).json({
    status: 'fail',
    error: {
      message: msg,
    },
  });
};

const auth = async (req, res, next) => {
  try {
    // 1) Getting token and check of it's there
    if (!req.query.key) {
      return sendError(res, 'Not Authorized', 401);
    }

    const { key } = req.query;

    const foundUser = await User.findOne({
      APIKEY: key.toLowerCase(),
    });
    if (!foundUser) {
      return sendError(res, 'API Key is Invalid', 401);
    }
    if (!foundUser.isVerified) {
      return sendError(res, 'Please verify your email', 401);
    }
    if (foundUser.APIKEYEXPIRES < Date.now()) {
      return sendError(res, 'API Key is expired', 401);
    }

    req.user = foundUser;
    next();
  } catch (error) {
    sendError(res, 'Server Error', 500);
  }
};

module.exports = auth;
