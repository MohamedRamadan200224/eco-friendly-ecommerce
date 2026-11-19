const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  products: [
    {
      product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
      },
      quantity: {
        type: Number,
        default: 0,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: new Date(),
  },
  // Set only by the Stripe webhook, after a verified payment.
  // Used for webhook idempotency (one order per checkout session).
  stripeCheckoutSessionId: {
    type: String,
    unique: true,
    sparse: true,
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'pending', 'failed'],
    default: 'pending',
  },
  amountTotal: {
    type: Number,
  },
});

orderSchema.index({ user: 1 });

orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  }).populate({
    path: 'products.product',
    select: 'name price  imageCover category',
  });
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
