const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');
const Order = require('./../models/orderModel');

exports.getMyOrders = catchAsync(async (req, res, next) => {
  const pastOrders = await Order.find({ user: req.user.id });

  if (!pastOrders) {
    return next(new AppError("You haven't purchased any items yet!", 400));
  }

  res.status(200).json({
    status: 'success',
    orders: pastOrders,
  });
});
