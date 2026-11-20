const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');

const signToken = (id) => {
  if (!process.env.JWT_SECRET) {
    // Fail loudly instead of signing tokens with an undefined secret.
    throw new AppError(
      'JWT_SECRET is not configured. Set it before starting the server.',
      500
    );
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // httpOnly: JS in the browser (including any injected script) cannot
    // read the token. The browser sends it automatically with requests
    // made with credentials (see FrontEnd CartModal / axios calls).
    httpOnly: true,
    // Cross-site cookie: the frontend (eco-friendly-ecommerce.vercel.app)
    // and this API (eco-backend-gamma.vercel.app) are different sites
    // (vercel.app is a public suffix), so a SameSite=Lax cookie is never
    // stored or sent by the browser on cross-site fetch calls and login
    // never sticks in a real browser. API clients like curl don't enforce
    // SameSite, which is why login looked fine in every API test.
    // Production therefore needs SameSite=None, which browsers only accept
    // with Secure (set below). Locally the app runs on localhost
    // (same-site), where Lax is correct — None without Secure would be
    // rejected by the browser.
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  // NOTE: the JWT is intentionally NOT returned in the JSON body anymore.
  // It lives only in the httpOnly cookie. Clients must send requests with
  // credentials (axios: withCredentials: true) and must not store the
  // token in sessionStorage / localStorage (see FrontEnd/src/helper/Storage.js).
  res.status(statusCode).json({
    status: 'success',
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // SECURITY: never accept `role` from the request body. A client could
  // otherwise self-assign 'admin' / 'expert' / 'company' on signup.
  // Every new account starts as a plain 'user'; role changes are an
  // admin-only operation through a dedicated endpoint (not yet implemented).
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);
});

// Log out: clear the httpOnly `jwt` cookie. The old frontend Logout only
// cleared sessionStorage, so the 90-day cookie stayed valid and API calls
// made with credentials stayed authenticated after "logout". The cookie
// must be cleared with the same SameSite / Secure options it was set
// with, or the browser keeps the old one.
exports.logout = (req, res) => {
  const cookieOptions = {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', 'loggedout', cookieOptions);
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  // Preferred source: the httpOnly cookie set by createSendToken.
  // Transitional fallback: Authorization: Bearer <token>. This exists only
  // so clients that have not been migrated to cookie auth yet keep working;
  // it should be removed once every frontend caller uses withCredentials.
  // (requires cookie-parser middleware, registered in app.js)
  let token;
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verification token
  let decoded;
  try {
    decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new AppError('Invalid token. Please log in again.', 401));
  }

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });

  // SECURITY: always return the same generic 200, whether or not an
  // account exists for this email. Returning 404 for unknown emails lets
  // anyone enumerate registered accounts.
  if (!user) {
    return res.status(200).json({
      status: 'success',
      message:
        'If an account exists for this email, a password reset link has been sent.',
    });
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetURL = `${frontendUrl}/resetpassword/${resetToken}`;

  try {
    await new Email(user, resetURL).sendPasswordReset();

    return res.status(200).json({
      status: 'success',
      message:
        'If an account exists for this email, a password reset link has been sent.',
    });
  } catch (err) {
    // Email failed: clear the reset token and log server-side, but still
    // return the generic response so the caller cannot tell the difference.
    console.error('Failed to send password reset email:', err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      status: 'success',
      message:
        'If an account exists for this email, a password reset link has been sent.',
    });
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});
