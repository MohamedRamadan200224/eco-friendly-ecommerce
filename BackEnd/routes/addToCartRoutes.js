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

router
  .route('/Checkout-session')
  .get(
    authController.protect,
    addToCartController.getCheckoutSession,
    addToCartController.completePurchase
  );

module.exports = router;
