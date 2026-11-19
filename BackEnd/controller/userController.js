const Product = require('../models/productModel');
const AppError = require('../utils/appError');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const handlerFactory = require('./handlerFactory');
const { filterObj, upload } = require('../utils/filterObj');
const sharp = require('sharp');

exports.uploadSinglePhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  //uploading image cover
  const date = new Date();

  req.file.filename = `${req.user.name.split(' ', 1)[0]}-${req.user.id}-${
    date.toISOString().split('T', 1)[0]
  }-photo.jpeg`;

  await sharp(req.file.buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

exports.updateMe = catchAsync(async (req, res, next) => {
  //create error if the user posts password
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates...Please use /updateMyPassword',
        400
      )
    );
  }

  // SECURITY: 'role' was in this allowlist, so any logged-in user could
  // promote themselves to admin by PATCHing /updateMe with { role: 'admin' }.
  // Only name / email / photo may be changed here.
  // NOTE: fields are separate arguments, not one array — see
  // utils/filterObj.js. The array form used on the perf/p0-scalability
  // branch matched nothing, so updateMe silently updated nothing.
  const filteredBody = filterObj(req.body, 'name', 'email', 'photo');

  if (req.file) {
    filteredBody.photo = req.file.filename;
  }

  //update user data
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    return next(
      new AppError("Couldn't update user data...Please try again later!", 400)
    );
  }

  //return updated user data
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const userDeactivated = await User.findByIdAndUpdate(req.user._id, {
    active: false,
  });
  await Product.deleteMany({ owner: req.user._id });

  if (!userDeactivated) {
    return next(new AppError("Couldn't deactivate your account", 400));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

exports.getAllUsers = handlerFactory.getAll(User, 'user');

//do not update password with this
// NOTE: handlerFactory.updateOne strips password / role / isCertified /
// rewardPoints, so an admin can no longer change a user's role or password
// through this generic route. Role changes need a dedicated admin endpoint.
exports.updateUser = handlerFactory.updateOne(User);

exports.getUser = handlerFactory.getOne(User, 'user');

exports.deleteUser = handlerFactory.deleteOne(User);

// Admin-only user creation. This is the ONE place that may accept a
// password and a role from a request body, and the route is protected by
// restrictTo('admin') in userRoutes.js. It deliberately does not use the
// generic handlerFactory.createOne, which never accepts those fields.
exports.createUser = catchAsync(async (req, res, next) => {
  // NOTE: fields are separate arguments, not one array — see
  // utils/filterObj.js. The array form used on the perf/p0-scalability
  // branch matched nothing, so User.create({}) always failed validation.
  const allowedFields = filterObj(
    req.body,
    'name',
    'email',
    'password',
    'passwordConfirm',
    'role'
  );

  const doc = await User.create(allowedFields);

  doc.password = undefined;

  res.status(201).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
});
