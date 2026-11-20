const catchAsync = require('../utils/catchAsync');
const Product = require('./../models/productModel');
const factory = require('./handlerFactory');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const Vote = require('../models/voteModel');
const User = require('./../models/userModel');

//Get all votes for specific product
const getAllVotes = (Model) =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on product (hack)
    let filter = {};
    if (req.params.productId) filter = { product: req.params.productId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const docs = await features.query;

    // An empty list is a valid result, not a 404.
    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        data: docs,
      },
    });
  });

//Create Vote for a user for a specific product and update the harmful status and reports number of products
const createVote = (voteModel, productModel) =>
  catchAsync(async (req, res, next) => {
    const doc = await voteModel.create({
      report: req.body.report,
      comment: req.body.comment,
      product: req.params.productId,
      user: req.user._id,
    });

    if (!doc) {
      return next(new AppError("Couldn't create the vote!", 400));
    }

    req.user.rewardPoints = Math.min(req.user.rewardPoints + 10, 100);
    req.user.lastVoted = new Date();
    await req.user.save({ validateBeforeSave: false });

    const reportedProduct = await productModel.findById(req.params.productId);

    if (!reportedProduct) {
      return next(new AppError('No product found with that ID', 404));
    }

    //check if product score is already assessed
    if (reportedProduct.environmentalImpactAssessed === true) {
      // NOTE: the schema fields are reportsNumber / noReportsNumber.
      // The old code incremented reportsNum / noReportsNum, which do not
      // exist on the schema — Mongoose (strict mode) silently dropped
      // them, so vote counts never changed and harmfultoenv was computed
      // from stale counters.
      if (req.body.report === true) {
        reportedProduct.reportsNumber += 1;
      } else if (req.body.report === false) {
        reportedProduct.noReportsNumber += 1;
      }

      // A product with a passing environmental score is never harmful,
      // regardless of votes. Otherwise it is harmful when reports
      // outnumber non-reports.
      if (reportedProduct.environmentalScore >= 10) {
        reportedProduct.harmfultoenv = false;
      } else {
        reportedProduct.harmfultoenv =
          reportedProduct.reportsNumber > reportedProduct.noReportsNumber;
      }

      await reportedProduct.save();
    }

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getVoteUserIds = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  if (!req.body.vote) req.body.vote = req.params.voteId;
  next();
};

//user CRUD Car votes

exports.updateMyVote = factory.updateMyReviewOrVote(Vote);

exports.deleteMyVote = factory.deleteMyReviewOrVote(Vote);

//admin CRUD Car votes

exports.getVote = factory.getOne(Vote, 'vote');

exports.getAllVotes = getAllVotes(Vote);

exports.deleteVote = factory.deleteOne(Vote);

exports.updateVote = factory.updateOne(Vote);

//check if this user already voted this product
exports.checkVote = factory.checkIfDoneBefore(Vote);

exports.createVote = createVote(Vote, Product);
