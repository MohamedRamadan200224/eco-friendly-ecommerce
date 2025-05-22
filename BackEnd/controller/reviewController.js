const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory');
const User = require('./../models/userModel');

exports.getReviewUserId = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  if (!req.body.review) req.body.review = req.params.reviewId;
  next();
};

exports.checkReview = factory.checkIfDoneBefore(Review);

exports.createReview = factory.createOne(Review, 'review');
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.getReview = factory.getOne(Review, 'review');
exports.getAllReviews = factory.getAll(Review, 'review');

exports.updateMyReview = factory.updateMyReviewOrVote(Review);
exports.deleteMyReview = factory.deleteMyReviewOrVote(Review);
