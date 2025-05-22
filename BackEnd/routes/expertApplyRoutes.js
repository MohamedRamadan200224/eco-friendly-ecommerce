const express = require('express');
const expertApplyController = require('./../controller/expertApplyController');
const authController = require('./../controller/authController');

const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    expertApplyController.getAllAplications
  )
  .post(
    authController.protect,
    authController.restrictTo('user'),
    expertApplyController.apply
  );
router
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    expertApplyController.getUserApplication
  )
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    expertApplyController.updateApplicationStatus,
    expertApplyController.clearApplication
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    expertApplyController.deleteApplication
  );

module.exports = router;
