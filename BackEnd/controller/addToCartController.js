const AddToCart = require('../models/addToCartModel');
const Order = require('./../models/orderModel');
const factory = require('./handlerFactory');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');
const nodeHtmlToImage = require('node-html-to-image');
const catchAsync = require('./../utils/catchAsync');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { isEmpty } = require('validator');
const User = require('./../models/userModel');
const Product = require('./../models/productModel');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the cart
  const cart = await AddToCart.findOne({ user: req.user.id }).populate(
    'products.product'
  );
  if (!cart || cart.products.length === 0) {
    return next(new AppError('You have no items in your cart', 400));
  }

  // Retrieve user and their points
  const user = await User.findById(req.user.id);
  const MIN_POINTS_REQUIRED = 100; // Minimum points required to redeem for a discount

  // Coupon IDs
  const rewardPointsCouponId = 'newCoupon'; // Coupon for reward points
  const ecoFriendlyCouponId = 'ecofriendly'; // Coupon for eco-friendly discount

  // Initialize variables
  let selectedCouponId = null;

  // Check if the user has at least MIN_POINTS_REQUIRED
  if (user.rewardPoints >= MIN_POINTS_REQUIRED) {
    selectedCouponId = rewardPointsCouponId;
    // Deduct reward points from the user's account
    user.rewardPoints -= MIN_POINTS_REQUIRED;
    await user.save({ validateBeforeSave: false });
  } else {
    // Check for products that are not harmful to the environment
    const hasEcoFriendlyProduct = cart.products.some(
      (el) => el.product.harmfultoenv === false
    );

    if (hasEcoFriendlyProduct) {
      selectedCouponId = ecoFriendlyCouponId;
    }
  }

  // Apply the selected coupon if any discount is applicable
  let discounts = [];
  if (selectedCouponId) {
    discounts.push({ coupon: selectedCouponId });
  }

  // Create a Checkout Session with the discounts applied
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://localhost:5173/profile`,
    cancel_url: `${req.protocol}://localhost:5173/`,
    customer_email: req.user.email,
    client_reference_id: req.user.id,
    mode: 'payment',
    line_items: cart.products.map((el) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: el.product.name,
          description: el.product.specifications,
        },
        unit_amount: el.product.price * 100, // Assuming price is in dollars
      },
      quantity: el.quantity,
    })),
    discounts: discounts,
  });

  for (let el of cart.products) {
    let product = await Product.findById(el.product._id);
    product.soldNum += el.quantity;
    product.stockQuantity -= el.quantity;
    await product.save({ validateBeforeSave: false });
  }

  res.status(200).json({
    status: 'success',
    session,
  });
  next();
});

exports.getMyCartItems = catchAsync(async (req, res, next) => {
  const cartItems = await AddToCart.find({
    user: req.user._id,
  });
  let totalPrice = 0;

  cartItems[0].products.forEach((product) => {
    totalPrice += product.product.price;
  });

  if (cartItems.length === 0) {
    return next(new AppError("You don't have any items in your cart!", 400));
  }

  res.status(200).json({
    status: 'success',
    totalPrice: totalPrice,
    data: cartItems[0].products,
  });
});

exports.addItemToCart = catchAsync(async (req, res, next) => {
  const productId = req.params.id;
  const userId = req.user.id;
  const quantity = req.body.quantity || 1;

  // Find the cart for the current user
  let cart = await AddToCart.findOne({ user: userId });

  // If the cart does not exist, create a new one
  if (!cart) {
    cart = await AddToCart.create({ user: userId, products: [] });
  }

  let product = await Product.findOne({ _id: productId });

  if (product.stockQuantity === 0) {
    return next(new AppError('This Product Is Out Of Stock!', 400));
  }

  // Check if the product is already in the cart
  const itemIndex = cart.products.findIndex(
    (item) => item.product.id === productId
  );

  if (itemIndex >= 0) {
    // If the product is already in the cart, update the quantity
    return next(
      new AppError('You Have Already Added This Product In Your Cart!', 400)
    );
  } else {
    // If the product is not in the cart, add it

    cart.products.push({ product: productId, quantity });
  }

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

  console.log(
    `Attempting to delete product with ID: ${productId} for user: ${userId}`
  );

  // Find the cart for the current user
  let cart = await AddToCart.findOne({ user: userId });

  if (!cart) {
    return next(new AppError('No cart found for the user!', 400));
  }

  // Check if the product is in the cart
  const itemIndex = cart.products.findIndex(
    (item) => item.product.toString() === productId
  );

  if (!itemIndex) {
    return next(
      new AppError('No product found with that ID in the cart!', 400)
    );
  }

  // Remove the product from the cart
  cart.products.splice(itemIndex, 1);

  // Save the updated cart
  const updatedCart = await cart.save();

  // let totalPrice = 0;
  // console.log(updatedCart[0].product.price);

  // updatedCart.map((product) => {
  //   totalPrice += product.product.price;
  // });

  res.status(200).json({
    status: 'success',

    data: updatedCart,
  });
});

exports.updateItemQuantity = catchAsync(async (req, res, next) => {
  const productId = req.params.id;
  const userId = req.user.id;
  const newQuantity = req.body.quantity;

  // Find the cart for the current user
  let cart = await AddToCart.findOne({ user: userId });

  if (!cart) {
    return next(new AppError('No cart found for the user!', 400));
  }

  // Check if the product is in the cart
  const itemIndex = cart.products.findIndex((item) =>
    item.product.equals(productId)
  );

  if (itemIndex === -1) {
    return next(new AppError('No product found with that ID!', 400));
  }
  if (cart.products[itemIndex].product.stockQuantity < newQuantity) {
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

exports.completePurchase = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  // Find the cart for the current user
  let cart = await AddToCart.findOne({ user: userId });

  if (!cart || cart.products.length === 0) {
    return next(new AppError('You have no items in your cart!', 400));
  }

  // Create a new order with the products from the cart
  const order = await Order.create({ user: userId, products: cart.products });

  // Clear the user's cart

  // Delete the user's cart
  await AddToCart.findByIdAndDelete(cart._id);

  res.status(200).json({
    status: 'success',
    data: { order },
  });
});

exports.deleteAllItems = catchAsync(async (req, res, next) => {
  const user = req.user.id;

  const cart = await AddToCart.findOne({ user: user });

  if (!cart) {
    return next(
      new AppError('You already does not have any items in your cart!', 400)
    );
  }

  cart.products = [];
  await cart.save();

  res.status(201).json({
    status: 'success',
  });
});
