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
      .sort({ upvoteNum: -1 })
      .limitFields()
      .paginate();

    const docs = await features.query;

    if (!docs) {
      return next(new AppError('No votes were found!', 404));
    }

    // SEND RESPONSE
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

    //check if product score is already assessed
    if (
      req.body.report === true &&
      reportedProduct.environmentalImpactAssessed === true
    ) {
      //if the score greater than or equal to 10 then update the harmfulToEnv to false else if it's score less than 10 and reports is greater than 5 then harmfultoEnv to true
      if (reportedProduct.environmentalScore >= 10) {
        reportedProduct.reportsNum = reportedProduct.reportsNum + 1;
        reportedProduct.harmfultoenv = false;
      } else if (
        reportedProduct.reportsNum + 1 > reportedProduct.noReportsNum &&
        reportedProduct.environmentalScore < 10
      ) {
        reportedProduct.reportsNum = reportedProduct.reportsNum + 1;
        reportedProduct.harmfultoenv = true;
      } else if (
        reportedProduct.reportsNum + 1 <= reportedProduct.noReportsNum &&
        reportedProduct.environmentalScore < 10
      ) {
        reportedProduct.reportsNum = reportedProduct.reportsNum + 1;
      }
      await reportedProduct.save();
    } else if (
      req.body.report === false &&
      reportedProduct.environmentalImpactAssessed === true
    ) {
      //if the score greater than or equal to 10 then update the harmfulToEnv to false else if it's score less than 10 and reports is greater than 5 then harmfultoEnv to true
      if (reportedProduct.environmentalScore >= 10) {
        reportedProduct.noReportsNum = reportedProduct.noReportsNum + 1;
        reportedProduct.harmfultoenv = false;
      } else if (
        reportedProduct.noReportsNum + 1 > reportedProduct.reportsNum &&
        reportedProduct.environmentalScore < 10
      ) {
        reportedProduct.noReportsNum = reportedProduct.noReportsNum + 1;
        reportedProduct.harmfultoenv = false;
      } else if (
        reportedProduct.noReportsNum + 1 <= reportedProduct.reportsNum &&
        reportedProduct.environmentalScore < 10
      ) {
        reportedProduct.noReportsNum = reportedProduct.noReportsNum + 1;
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
