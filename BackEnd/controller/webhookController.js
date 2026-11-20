const mongoose = require('mongoose');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const AddToCart = require('../models/addToCartModel');
const Order = require('./../models/orderModel');
const Product = require('./../models/productModel');
const User = require('./../models/userModel');

const MIN_POINTS_REQUIRED = 100;

// Lazily create the Stripe client so requiring this module does not crash
// when the Stripe keys are not set.
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  // eslint-disable-next-line global-require
  return require('stripe')(process.env.STRIPE_SECRET_KEY);
};

/**
 * POST /api/v1/webhooks/stripe
 *
 * Stripe calls this endpoint AFTER a payment succeeds. The signature is
 * verified with STRIPE_WEBHOOK_SECRET, so a client cannot fake a payment
 * by calling the endpoint directly.
 *
 * This is the ONLY place an Order is created for a checkout. The old flow
 * created the order (and decremented stock / deducted reward points) in
 * getCheckoutSession, before any payment had happened — anyone could get
 * a free order by calling that endpoint and never paying.
 *
 * Requirements:
 * - The route must receive the RAW request body (express.raw), because
 *   Stripe's signature is computed over the raw bytes. It is therefore
 *   mounted in app.js BEFORE express.json().
 * - The Mongoose transaction requires MongoDB running as a replica set
 *   (MongoDB Atlas, or a local `mongod --replSet`). On a standalone
 *   server the transaction fails, the handler returns 500, and Stripe
 *   retries the webhook — which is safe, because order creation is
 *   idempotent (see below).
 */
exports.handleStripeWebhook = catchAsync(async (req, res, next) => {
  const stripe = getStripe();
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Stripe webhook is not configured (missing secret key).');
    return next(new AppError('Payments are not configured.', 503));
  }

  const signature = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Only checkout completion creates an order. Acknowledge everything
  // else so Stripe does not keep retrying it.
  if (event.type !== 'checkout.session.completed') {
    return res.status(200).json({ received: true });
  }

  const session = event.data.object;
  const userId = session.client_reference_id || session.metadata?.userId;

  if (!userId) {
    console.error('Stripe session has no user id:', session.id);
    return res.status(200).json({ received: true });
  }

  const mongoSession = await mongoose.startSession();
  try {
    await mongoSession.withTransaction(async () => {
      // Idempotency: Stripe retries webhooks, and a retried event must
      // never create a second order or decrement stock twice.
      const existingOrder = await Order.findOne({
        stripeCheckoutSessionId: session.id,
      }).session(mongoSession);
      if (existingOrder) return;

      const cart = await AddToCart.findOne({ user: userId }).session(
        mongoSession
      );
      if (!cart || cart.products.length === 0) {
        console.error(
          `Stripe session ${session.id}: no cart found for user ${userId}`
        );
        return;
      }

      // Atomically decrement stock, guarded so it can never go negative.
      // If another checkout already took the last units, the $inc is
      // skipped for that product and the shortfall is logged for manual
      // follow-up instead of overselling.
      const stockFailures = [];
      for (const item of cart.products) {
        const result = await Product.updateOne(
          {
            _id: item.product,
            stockQuantity: { $gte: item.quantity },
          },
          {
            $inc: {
              stockQuantity: -item.quantity,
              soldNum: item.quantity,
            },
          }
        ).session(mongoSession);

        if (result.modifiedCount === 0) {
          stockFailures.push(String(item.product));
        }
      }
      if (stockFailures.length > 0) {
        console.error(
          `Stripe session ${session.id}: insufficient stock for products ${stockFailures.join(', ')} — order still recorded, needs manual follow-up.`
        );
      }

      // Reward points are only deducted now, after a successful payment,
      // and only if the reward coupon was actually applied at checkout.
      if (session.metadata?.rewardCouponApplied === 'true') {
        await User.updateOne(
          { _id: userId, rewardPoints: { $gte: MIN_POINTS_REQUIRED } },
          { $inc: { rewardPoints: -MIN_POINTS_REQUIRED } }
        ).session(mongoSession);
      }

      await Order.create(
        [
          {
            user: userId,
            products: cart.products,
            stripeCheckoutSessionId: session.id,
            paymentStatus: 'paid',
            amountTotal:
              typeof session.amount_total === 'number'
                ? session.amount_total / 100
                : undefined,
          },
        ],
        { session: mongoSession }
      );

      // Clear the cart only after the order exists.
      await AddToCart.findByIdAndDelete(cart._id).session(mongoSession);
    });
  } finally {
    await mongoSession.endSession();
  }

  res.status(200).json({ received: true });
});
