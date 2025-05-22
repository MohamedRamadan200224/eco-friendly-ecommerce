const express = require('express');
const userController = require('./../controller/userController');
const authController = require('./../controller/authController');
const User = require('./../models/userModel');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
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
