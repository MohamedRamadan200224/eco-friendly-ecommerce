const mongoose = require('mongoose');
const Product = require('../models/productModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const handlerFactory = require('./handlerFactory');

// Fields a seller may set when creating / updating their own product.
// Deliberately NOT included: 'owner' (set server-side from req.user.id),
// 'harmfultoenv' and 'environmentalScore' (computed server-side by
// calculateEnvironmentalScore), and the aggregated counters
// (ratingsAverage / ratingsQuantity / soldNum / reportsNumber /
// noReportsNumber), which must never be client-settable.
const filteredBody = [
  'name',
  'specifications',
  'category',
  'price',
  'stockQuantity',
  'imageCover',
  'images',
];

exports.getMyProduct = handlerFactory.getMyProducts(Product);

exports.createMyProduct = handlerFactory.createMyProduct(Product, filteredBody);

exports.updateMyProduct = handlerFactory.updateMyProduct(
  Product,
  'product',
  filteredBody
);

exports.deleteMyProduct = handlerFactory.deleteMyProduct(Product);

exports.getAllProducts = handlerFactory.getAll(Product, 'product');

// GET /api/v1/products/:slug — slug-first lookup, falling back to an
// ObjectId lookup so old id-based links and bookmarks keep working.
// (The generic factory getOne only does findById, so this route has its
// own handler.) The nested review / vote / cart calls stay ObjectId-based
// internally — only the URL changed.
exports.getProduct = catchAsync(async (req, res, next) => {
  const param = req.params.id;
  let doc = await Product.findOne({ slug: param }).populate([
    { path: 'reviews' },
    { path: 'votes' },
  ]);
  if (!doc && mongoose.Types.ObjectId.isValid(param)) {
    doc = await Product.findById(param).populate([
      { path: 'reviews' },
      { path: 'votes' },
    ]);
  }

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  // Expired sale, computed at read time only (no DB write on a GET).
  handlerFactory.applyExpiredSaleInMemory(doc);

  res.status(200).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
});
exports.createProduct = handlerFactory.createOne(Product, 'product');

exports.updateProduct = handlerFactory.updateOne(Product);

exports.deleteProduct = handlerFactory.deleteOne(Product);

exports.discountProduct = handlerFactory.activateDiscount(Product);

exports.removeProductDiscount = handlerFactory.deactivateDiscount(Product);

exports.resizeProductImgs = handlerFactory.resizeImgs('product');
