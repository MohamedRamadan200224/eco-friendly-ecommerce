const Review = require('./../models/reviewModel');
const Order = require('./../models/orderModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
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

// Buyer feedback (review: star rating + text) is only for buyers: the
// caller must have a PAID order containing this product. Orders are
// created only by the Stripe webhook after a verified payment, so a
// paid order is proof of purchase — there is no other way to get one.
//
// User and product are SERVER-derived (req.user + the product resolved
// from the URL), like createVote does. The old code was the generic
// createOne, which trusted req.body.user / req.body.product — a caller
// could post a review as someone else or on a different product than
// the URL names.
exports.createReview = catchAsync(async (req, res, next) => {
  const product = await factory.findProductBySlugOrId(req.params.productId);

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  const purchase = await Order.findOne({
    user: req.user.id,
    'products.product': product._id,
    paymentStatus: 'paid',
  });

  if (!purchase) {
    return next(
      new AppError(
        'Only buyers who purchased this product can review it.',
        403
      )
    );
  }

  const doc = await Review.create({
    review: req.body.review,
    rating: req.body.rating,
    product: product._id,
    user: req.user._id,
  });

  res.status(201).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
});

exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.getReview = factory.getOne(Review, 'review');
exports.getAllReviews = factory.getAll(Review, 'review');

exports.updateMyReview = factory.updateMyReviewOrVote(Review);
exports.deleteMyReview = factory.deleteMyReviewOrVote(Review);
