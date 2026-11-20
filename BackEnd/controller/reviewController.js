const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory');

exports.getReviewUserId = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  // NOTE: the old code also did `req.body.review = req.params.reviewId`.
  // That param does not exist on these routes (the param is :id), so it
  // always stuffed `undefined` into the review-text field — and with the
  // filterObj fix in handlerFactory.updateMyReviewOrVote, that undefined
  // would have ridden along into the update. The factory identifies the
  // review from req.params.id + req.user._id, so nothing here needs the
  // review id in the body. Line removed, not renamed.
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
