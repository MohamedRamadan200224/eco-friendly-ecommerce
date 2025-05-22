const express = require('express');
const orderController = require('./../controller/orderController');
const userController = require('./../controller/userController');
const authController = require('./../controller/authController');

const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('expert', 'user'),
    orderController.getMyOrders
  );

module.exports = router;
