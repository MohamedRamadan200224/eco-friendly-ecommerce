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

// Seller ("my products") section. Every route below requires a logged-in
// company or admin account.
//
// SECURITY: the router.use(protect, restrictTo(...)) guard used to sit in
// the middle of this section, after the PATCH /myProducts/:id route, so
// whether a route was protected depended on where it happened to be
// written — one reorder away from exposing a write route. It now sits at
// the top of the section, before the first /myProducts route, so all of
// them are covered and the per-route inline guards are gone.
// Note: on the perf/p0-scalability branch the DELETE /myProducts/:id
// route already happened to sit after the guard, so it was already
// protected; this move makes the protection structural instead of
// accidental, and it also closes the real gap, which was POST
// /myProducts: it only had protect (any logged-in role could create a
// seller product). It is now company/admin only, like the rest of the
// section. The guard is restrictTo('company', 'admin') — not 'company'
// alone — because PATCH /myProducts/:id previously allowed admins too,
// and a company-only guard here would have silently revoked that.
router.use(authController.protect, authController.restrictTo('company', 'admin'));

router
  .route('/myProducts')
  .post(
    factory.uploadImgs,
    productController.resizeProductImgs,
    productController.createMyProduct
  );

router
  .route('/myProducts/:id')
  .get(productController.getMyProduct)
  .patch(
    factory.uploadImgs,
    productController.resizeProductImgs,
    productController.updateMyProduct
  )
  .delete(productController.deleteMyProduct);

module.exports = router;
