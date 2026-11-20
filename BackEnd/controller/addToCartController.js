const mongoose = require('mongoose');
const AddToCart = require('../models/addToCartModel');
const factory = require('./handlerFactory');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');
const Product = require('./../models/productModel');

const MIN_POINTS_REQUIRED = 100; // Minimum points required to redeem for a discount

// The cart's products.product is populated by the model's pre-find hook,
// so it may be a full Product document or (in some paths) a bare ObjectId.
// Normalise both to the id string before comparing.
const cartProductId = (item) =>
  item.product && item.product._id
    ? item.product._id.toString()
    : String(item.product);

// Coupon ids are configuration, not code. Set them in the environment;
// when they are not configured, no coupon is applied instead of silently
// using a hard-coded test coupon id.
const getRewardCouponId = () => process.env.STRIPE_REWARD_COUPON_ID || null;
const getEcoCouponId = () => process.env.STRIPE_ECO_COUPON_ID || null;

// Lazily create the Stripe client so requiring this module does not crash
// when STRIPE_SECRET_KEY is not set (e.g. in tests / local dev without
// payments configured). Callers must handle a null return.
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  // eslint-disable-next-line global-require
  return require('stripe')(process.env.STRIPE_SECRET_KEY);
};

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const stripe = getStripe();
  if (!stripe) {
    return next(
      new AppError('Payments are not configured on this server.', 503)
    );
  }

  // 1) Get the cart
  const cart = await AddToCart.findOne({ user: req.user.id }).populate(
    'products.product'
  );
  if (!cart || cart.products.length === 0) {
    return next(new AppError('You have no items in your cart', 400));
  }

  // Retrieve user and their points
  const user = await User.findById(req.user.id);

  // Decide which coupon (if any) applies. This only DECIDES — nothing is
  // mutated here. Reward points and stock are only changed after Stripe
  // confirms the payment, in the webhook handler (webhookController.js).
  // The old code deducted points and decremented stock here, before any
  // payment, and then created the order unconditionally (see the removed
  // completePurchase chaining in addToCartRoutes.js).
  let selectedCouponId = null;
  let rewardCouponApplied = false;

  if (user && user.rewardPoints >= MIN_POINTS_REQUIRED) {
    selectedCouponId = getRewardCouponId();
    rewardCouponApplied = Boolean(selectedCouponId);
  } else {
    // Check for products that are not harmful to the environment
    const hasEcoFriendlyProduct = cart.products.some(
      (el) => el.product && el.product.harmfultoenv === false
    );

    if (hasEcoFriendlyProduct) {
      selectedCouponId = getEcoCouponId();
    }
  }

  // Apply the selected coupon if any discount is applicable
  const discounts = [];
  if (selectedCouponId) {
    discounts.push({ coupon: selectedCouponId });
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  // Validate line items: a product may have been deleted since it was
  // added to the cart, and prices must become integer cents.
  const lineItems = [];
  for (const el of cart.products) {
    if (!el.product) {
      return next(
        new AppError(
          'One of the products in your cart is no longer available.',
          400
        )
      );
    }
    if (el.product.stockQuantity < el.quantity) {
      return next(
        new AppError(
          `Not enough stock for ${el.product.name}. Only ${el.product.stockQuantity} left.`,
          400
        )
      );
    }
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: el.product.name,
          description: el.product.specifications,
        },
        unit_amount: Math.round(el.product.price * 100),
      },
      quantity: el.quantity,
    });
  }

  // Create a Checkout Session with the discounts applied
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${frontendUrl}/profile`,
    cancel_url: `${frontendUrl}/`,
    customer_email: req.user.email,
    client_reference_id: req.user.id,
    mode: 'payment',
    line_items: lineItems,
    discounts,
    metadata: {
      userId: req.user.id,
      rewardCouponApplied: String(rewardCouponApplied),
    },
  });

  // NOTE: no stock / points mutation and no order creation here. The order
  // is created by the Stripe webhook (checkout.session.completed) only
  // after the payment is verified. See controller/webhookController.js.
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.getMyCartItems = catchAsync(async (req, res, next) => {
  const cartItems = await AddToCart.find({
    user: req.user._id,
  });

  // An empty cart is a normal state, not an error. The old code answered
  // 400 here, so the cart modal's refetch after deleting the last item
  // failed and the just-deleted items stayed visible forever (ghost cart).
  // Items whose product was deleted from the catalogue (populate yields
  // product: null) are filtered out instead of crashing the modal.
  const products = (cartItems[0]?.products || []).filter(
    (item) => item.product
  );

  let totalPrice = 0;

  products.forEach((item) => {
    // Total is price x quantity, not just the unit price.
    totalPrice += item.product.price * item.quantity;
  });

  res.status(200).json({
    status: 'success',
    totalPrice,
    data: products,
  });
});

exports.addItemToCart = catchAsync(async (req, res, next) => {
  const productId = req.params.id;
  const userId = req.user.id;
  const quantity = Number(req.body.quantity) || 1;

  if (!Number.isInteger(quantity) || quantity < 1) {
    return next(new AppError('Quantity must be a positive integer.', 400));
  }

  // Find the cart for the current user
  let cart = await AddToCart.findOne({ user: userId });

  // If the cart does not exist, create a new one
  if (!cart) {
    cart = await AddToCart.create({ user: userId, products: [] });
  }

  const product = await Product.findOne({ _id: productId });

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  if (product.stockQuantity === 0 || product.stockQuantity < quantity) {
    return next(new AppError('This Product Is Out Of Stock!', 400));
  }

  // Check if the product is already in the cart
  const itemIndex = cart.products.findIndex(
    (item) => cartProductId(item) === productId
  );

  if (itemIndex >= 0) {
    // If the product is already in the cart, update the quantity
    return next(
      new AppError('You Have Already Added This Product In Your Cart!', 400)
    );
  }
  // If the product is not in the cart, add it
  cart.products.push({ product: productId, quantity });

  // Save the updated cart
  const updatedCart = await cart.save();

  res.status(201).json({
    status: 'success',
    data: updatedCart,
  });
});

exports.deleteItemFromCart = catchAsync(async (req, res, next) => {
  const productId = req.params.id;
  const userId = req.user.id;

  // Find the cart for the current user
  let cart = await AddToCart.findOne({ user: userId });

  if (!cart) {
    return next(new AppError('No cart found for the user!', 400));
  }

  // Check if the product is in the cart
  const itemIndex = cart.products.findIndex(
    (item) => cartProductId(item) === productId
  );

  // The old code used `if (!itemIndex)`: index 0 is falsy (so the first
  // item could never be deleted) and -1 is truthy (so a missing item
  // passed the check and splice(-1, 1) removed the LAST item).
  if (itemIndex === -1) {
    return next(
      new AppError('No product found with that ID in the cart!', 400)
    );
  }

  // Remove the product from the cart
  cart.products.splice(itemIndex, 1);

  // Save the updated cart
  const updatedCart = await cart.save();

  res.status(200).json({
    status: 'success',
    data: updatedCart,
  });
});

exports.updateItemQuantity = catchAsync(async (req, res, next) => {
  const productId = req.params.id;
  const userId = req.user.id;
  const newQuantity = Number(req.body.quantity);

  if (!Number.isInteger(newQuantity) || newQuantity < 1) {
    return next(new AppError('Quantity must be a positive integer.', 400));
  }

  // Find the cart for the current user
  const cart = await AddToCart.findOne({ user: userId });

  if (!cart) {
    return next(new AppError('No cart found for the user!', 400));
  }

  // Check if the product is in the cart
  const itemIndex = cart.products.findIndex(
    (item) => cartProductId(item) === productId
  );

  if (itemIndex === -1) {
    return next(new AppError('No product found with that ID!', 400));
  }

  // Read stock from the Product document itself, not from the (possibly
  // unpopulated) cart reference. The old code read
  // cart.products[itemIndex].product.stockQuantity, which is undefined
  // when the embedded product is only an ObjectId.
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('No product found with that ID!', 404));
  }
  if (product.stockQuantity < newQuantity) {
    return next(new AppError('This Product Is Out Of Stock!', 400));
  }

  // Update the quantity of the product
  cart.products[itemIndex].quantity = newQuantity;

  // Save the updated cart
  const updatedCart = await cart.save();

  res.status(200).json({
    status: 'success',
    data: updatedCart,
  });
});

exports.deleteAllItems = catchAsync(async (req, res, next) => {
  const user = req.user.id;

  const cart = await AddToCart.findOne({ user });

  if (!cart) {
    return next(
      new AppError('You already does not have any items in your cart!', 400)
    );
  }

  cart.products = [];
  await cart.save();

  res.status(200).json({
    status: 'success',
  });
});
