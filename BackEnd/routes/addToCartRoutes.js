const express = require('express');
const addToCartController = require('./../controller/addToCartController');
const authController = require('./../controller/authController');
const productRouter = require('./../routes/productRoutes');
const router = express.Router({ mergeParams: true });

//This router gets the product like(get one product) when clicking on the product in add to cart page
router.use('/:productid/product', productRouter);

router
  .route('/myCart')
  .get(
    authController.protect,
    authController.restrictTo('expert', 'user'),
    addToCartController.getMyCartItems
  )
  .delete(
    authController.protect,
    authController.restrictTo('expert', 'user'),
    addToCartController.deleteAllItems
  );

router
  .route('/myCart/:id')
  .delete(
    //In delete you send the id of the product
    authController.protect,
    authController.restrictTo('expert', 'user'),
    addToCartController.deleteItemFromCart
  )
  .post(
    //You send the id of the product
    authController.protect,
    authController.restrictTo('expert', 'user'),
    addToCartController.addItemToCart
  )
  .patch(
    //You send the id of the product
    authController.protect,
    authController.restrictTo('expert', 'user'),
    addToCartController.updateItemQuantity
  );

// Creates a Stripe Checkout Session only. It does NOT create an order and
// does NOT change stock or reward points. The order is created by the
// Stripe webhook (checkout.session.completed) after the payment is
// verified — see controller/webhookController.js and routes/webhookRoutes.js.
// The old route chained completePurchase here with next(), so an order was
// created (and stock decremented) before any payment had happened.
router
  .route('/Checkout-session')
  .get(authController.protect, addToCartController.getCheckoutSession);

module.exports = router;
