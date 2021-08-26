const router = require('express').Router();
const User = require('../../models/userSchema');
const { check, validationResult } = require('express-validator');
const Email = require('../../utils/email');
const crypto = require('crypto');
const { authLimiter } = require('../../utils/limiters');

// @desc    Register Route
// @access  Public
// @route   /api/v1/users
// @method  POST
router.post(
  '/',
  authLimiter,
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Email should be valid').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength(6),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        errors: errors.array(),
      });
    }

    try {
      const { name, email, password } = req.body;

      const user = await User.create({
        name,
        email,
        password,
        verificationToken: crypto.randomBytes(20).toString('hex'),
        verificationTokenExpires: Date.now() + 60 * 60 * 1000,
      });
      const url = `${req.protocol}://${req.get(
        'host'
      )}/api/v1/users/verify/?token=${user.verificationToken}`;
      await new Email(user, url).sendVerificationEmail();

      const responseData = {
        ...user._doc,
        _id: undefined,
        __v: undefined,
        password: undefined,
        verificationToken: undefined,
        verificationTokenExpires: undefined,
      };

      return res.json({
        status: 'success',
        data: {
          user: responseData,
        },
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          status: 'fail',
          data: {
            message: 'User already exists',
          },
        });
      }
      console.log(error.message);
    }
  }
);

// @desc    Route to get your api key
// @access  Public
// @route   /api/v1/users/me
// @method  POST
router.post(
  '/me',
  [
    check('email', 'Email should be valid').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength(6),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email: email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(400).json({
        status: 'fail',
        error: {
          message: 'Invalid email or password',
        },
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        status: 'fail',
        error: {
          message: 'Please verify your email',
        },
      });
    }

    const responseData = {
      ...user._doc,
      _id: undefined,
      __v: undefined,
      password: undefined,
      APIKEYEXPIRES: undefined,
    };

    return res.json({
      status: 'success',
      data: {
        user: responseData,
      },
    });
  }
);

// @desc    Verify email
// @access  Private
// @route   /api/v1/users/verify
// @method  GET
router.get('/verify', async (req, res) => {
  try {
    if (!req.query.token) {
      return res.status(400).json({
        status: 'fail',
        data: {
          message: 'Bad request',
        },
      });
    }
    const user = await User.findOne({
      verificationToken: req.query.token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        status: 'fail',
        data: {
          message: 'Token is invalid or has expired',
        },
      });
    }

    user.isVerified = true;
    user.verificationTokenExpires = undefined;
    user.verificationToken = undefined;

    user.APIKEY = crypto.randomBytes(6).toString('hex');
    user.APIKEYEXPIRES = Date.now() + 60 * 60 * 1000;

    const newUser = await user.save({ validateBeforeSave: false, new: true });
    const responseData = {
      ...newUser._doc,
      _id: undefined,
      __v: undefined,
      password: undefined,
      verificationToken: undefined,
      verificationTokenExpires: undefined,
      APIKEYEXPIRES: undefined,
    };

    res.json({
      status: 'success',
      data: {
        user: responseData,
      },
    });
  } catch (error) {}
});

module.exports = router;
