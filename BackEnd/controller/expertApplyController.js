const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const User = require('./../models/userModel');
const ExpertApply = require('./../models/expertApplyModel');
const factory = require('./handlerFactory');

exports.getAllAplications = catchAsync(async (req, res, next) => {
  const applications = await ExpertApply.find();

  if (!applications) {
    return next(new AppError('There are no applications yet', 404));
  }

  res.status(200).json({
    status: 'success',
    data: applications,
  });
});

exports.getUserApplication = catchAsync(async (req, res, next) => {
  const application = await ExpertApply.findById(req.params.id);

  if (!application) {
    return next(new AppError('No application for that user!', 404));
  }

  res.status(200).json({
    status: 'success',
    data: application,
  });
});

exports.deleteApplication = catchAsync(async (req, res, next) => {
  const application = await ExpertApply.findByIdAndDelete(req.params.id);
  if (!application) {
    return next(new AppError('There is no application with that id', 400));
  }
  res.status(204).json({
    status: 'success',
    message: 'Deleted Application Successfully',
  });
});

//create
exports.apply = catchAsync(async (req, res, next) => {
  // Check if the user has already applied
  const existingApplication = await ExpertApply.findOne({ user: req.user.id });

  // // If an application exists, return a message indicating so
  if (existingApplication) {
    return next(new AppError('You have applied before!', 400));
  }
  req.body.user = req.user.id;
  const application = await ExpertApply.create(req.body);
  res.status(200).json({
    status: 'success',
    message: 'Applied successfully',
  });
});

//update application status
exports.updateApplicationStatus = catchAsync(async (req, res, next) => {
  const application = await ExpertApply.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!application) {
    return next(new AppError('No application found with that ID', 404));
  }

  // If the application status is 'approved', update the user's role to 'expert'
  if (req.body.applicationStatus === 'approved') {
    await User.findByIdAndUpdate(application.user.id, {
      role: 'expert',
      lastVoted: new Date(),
    });
  }

  res.status(200).json({
    status: 'success',
    data: application,
  });
  next();
});

exports.clearApplication = catchAsync(async (req, res, next) => {
  const application = await ExpertApply.findByIdAndDelete(req.params.id);

  if (!application) {
    return next(
      new AppError('There is no application with that application', 400)
    );
  }
  next();
});
