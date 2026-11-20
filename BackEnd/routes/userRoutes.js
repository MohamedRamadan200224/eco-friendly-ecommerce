const express = require('express');
const rateLimit = require('express-rate-limit');
const userController = require('./../controller/userController');
const authController = require('./../controller/authController');
const User = require('./../models/userModel');

const router = express.Router();

// Stricter rate limiting for auth endpoints, on top of the global
// /api limiter in app.js (100 req/hour). Login / signup / forgot-password
// are the brute-force and email-spam vectors, so they get a much tighter
// budget: 10 attempts per IP per 15 minutes.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message:
    'Too many authentication attempts from this IP, please try again after 15 minutes.',
});

router.post('/signup', authLimiter, authController.signup);
router.post('/login', authLimiter, authController.login);

router.post('/forgotPassword', authLimiter, authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect);

router.patch(
  '/updateMyPassword',

  authController.updatePassword
);

router.get(
  '/me',

  userController.getMe,
  userController.getUser
);

router.patch(
  '/updateMe',
  userController.uploadSinglePhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);

router.delete('/deleteMe', userController.deleteMe);

router.use(authController.protect, authController.restrictTo('admin'));

router.post(
  '/',
  userController.uploadSinglePhoto,
  userController.resizeUserPhoto,
  userController.createUser
);

router.route('/').get(userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
