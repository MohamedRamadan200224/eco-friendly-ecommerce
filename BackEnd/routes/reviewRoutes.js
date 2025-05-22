const express = require('express');
const reviewController = require('./../controller/reviewController');
const factory = require('./../controller/handlerFactory');
const authController = require('./../controller/authController');
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.checkReview,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    reviewController.deleteReview
  )
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    reviewController.updateReview
  );

router
  .route('/myReview/:id')
  .patch(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.getReviewUserId,
    reviewController.updateMyReview
  )
  .delete(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.getReviewUserId,
    reviewController.deleteMyReview
  );

module.exports = router;
