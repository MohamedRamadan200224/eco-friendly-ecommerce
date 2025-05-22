const express = require('express');
const productController = require('./../controller/productController');
const userController = require('./../controller/userController');
const authController = require('./../controller/authController');
const reviewRouter = require('./../routes/reviewRoutes');
const voteRouter = require('./../routes/voteRoutes');
const factory = require('./../controller/handlerFactory');

const router = express.Router({ mergeParams: true });

router.use('/:productId/vote', voteRouter);

router.use('/:productId/review', reviewRouter);

router
  .route('/')
  .get(productController.getAllProducts)
  .post(
    authController.protect,
    factory.uploadImgs,
    productController.resizeProductImgs,
    productController.createProduct
  );
router
  .route('/:id')
  .get(productController.getProduct)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    productController.updateProduct
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    productController.deleteProduct
  );

router
  .route('/discount/:id')
  .patch(
    authController.protect,
    authController.restrictTo('company', 'admin'),
    productController.discountProduct
  );

router
  .route('/noDiscount/:id')
  .patch(
    authController.protect,
    authController.restrictTo('company', 'admin'),
    productController.removeProductDiscount
  );
router
  .route('/myProducts/:id')
  .patch(
    authController.protect,
    authController.restrictTo('company', 'admin'),
    factory.uploadImgs,
    productController.resizeProductImgs,
    productController.updateMyProduct
  );
router.use(authController.protect, authController.restrictTo('company'));

router
  .route('/myProducts')
  .post(
    authController.protect,
    factory.uploadImgs,
    productController.resizeProductImgs,
    productController.createMyProduct
  );

router.route('/myProducts/:id').get(productController.getMyProduct);

router
  .route('/myProducts/:id')

  .delete(productController.deleteMyProduct);

module.exports = router;
