const Product = require('../models/productModel');
const AppError = require('../utils/appError');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const handlerFactory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image!...Please upload an image', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadSinglePhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  //uploading image cover
  const date = new Date();
  //uploading image cover

  // req.body.photo = `${req.user.name.split(' ', 1)[0]}-${req.user.id}-${
  //   date.toISOString().split('T', 1)[0]
  // }-photo.jpeg`;

  // await sharp(req.files.photo[0].buffer)
  //   .resize(2000, 1333)
  //   .toFormat('jpeg')
  //   .jpeg({ quality: 90 })
  //   .toFile(`public/img/users/${req.body.photo}`);

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

  const filteredBody = filterObj(req.body, ['name', 'email', 'photo', 'role']);

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
exports.updateUser = handlerFactory.updateOne(User);

exports.getUser = handlerFactory.getOne(User, 'user');

exports.deleteUser = handlerFactory.deleteOne(User);

exports.createUser = handlerFactory.createOne(User, 'user');
