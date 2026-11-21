const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const User = require('./../models/userModel');
const ExpertApply = require('./../models/expertApplyModel');
const { filterObj } = require('./../utils/filterObj');

// Only the thirteen application answers may come from the client.
const APPLICATION_QUESTIONS = [
  'question1',
  'question2',
  'question3',
  'question4',
  'question5',
  'question6',
  'question7',
  'question8',
  'question9',
  'question10',
  'question11',
  'question12',
  'question13',
];

exports.getAllApplications = catchAsync(async (req, res, next) => {
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
    return next(
      new AppError('There is no application with that id', 400)
    );
  }
  // 204 means "no content", so a body must not be sent with it. The old
  // code sent 204 with a JSON body, which clients / proxies drop. 200
  // with data: null keeps the confirmation the old body carried.
  res.status(200).json({
    status: 'success',
    message: 'Deleted Application Successfully',
    data: null,
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
  // Allowlist the answers and FORCE 'pending': the old code passed the
  // whole body to create(), so a client-supplied applicationStatus
  // (e.g. 'approved') was stored as-is — a self-approved reviewer.
  const applicationData = {
    ...filterObj(req.body, ...APPLICATION_QUESTIONS),
    user: req.user.id,
    applicationStatus: 'pending',
  };
  await ExpertApply.create(applicationData);
  res.status(200).json({
    status: 'success',
    message: 'Applied successfully',
  });
});

//update application status
exports.updateApplicationStatus = catchAsync(async (req, res, next) => {
  // Allowlist: only the status may change here. The old code passed the
  // whole body to findByIdAndUpdate, so an admin call (or a forged one)
  // could overwrite the applicant's answers or user id along with it.
  const application = await ExpertApply.findByIdAndUpdate(
    req.params.id,
    filterObj(req.body, 'applicationStatus'),
    {
      new: true,
      runValidators: true,
    }
  );

  if (!application) {
    return next(new AppError('No application found with that ID', 404));
  }

  // If the application status is 'approved', update the user's role to 'expert'
  // (read from the stored document, not the request body).
  if (application.applicationStatus === 'approved') {
    await User.findByIdAndUpdate(application.user.id, {
      role: 'expert',
      lastVoted: new Date(),
    });
  }

  // The application STAYS in the list with its new status. The old code
  // called next() here into clearApplication, which deleted the record
  // right after updating it — the admin saw "Successfully approved" and
  // the application vanished. Deleting is a separate explicit action
  // (DELETE /:id → deleteApplication above).
  res.status(200).json({
    status: 'success',
    data: application,
  });
});
