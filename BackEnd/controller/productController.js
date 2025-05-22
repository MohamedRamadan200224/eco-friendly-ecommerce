const Product = require('../models/productModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const handlerFactory = require('./handlerFactory');

const filteredBody = [
  'name',
  'specifications',
  'category',
  'price',
  'owner',
  'stockQuantity',
  'harmfultoenv',
  'imageCover',
  'environmentalScore',
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

exports.getProduct = handlerFactory.getOne(Product, 'product', [
  {
    path: 'reviews',
  },
  {
    path: 'votes',
  },
]);
exports.createProduct = handlerFactory.createOne(Product, 'product');

exports.updateProduct = handlerFactory.updateOne(Product);

exports.deleteProduct = handlerFactory.deleteOne(Product);

exports.discountProduct = handlerFactory.activateDiscount(Product);

exports.removeProductDiscount = handlerFactory.deactivateDiscount(Product);

exports.resizeProductImgs = handlerFactory.resizeImgs('product');
