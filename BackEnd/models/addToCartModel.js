const mongoose = require('mongoose');

const addToCartSchema = new mongoose.Schema({
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
    // Date.now (the function) is evaluated per document. The old
    // `default: new Date()` was evaluated once, when this file was
    // loaded, so every document got the server's start time.
    default: Date.now,
  },
});

addToCartSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  }).populate({
    path: 'products.product',
    select: 'name price category imageCover harmfultoenv stockQuantity',
  });
  next();
});

// One cart per user (addItemToCart uses findOne({ user })).
addToCartSchema.index({ user: 1 }, { unique: true });

const AddToCart = mongoose.model('AddToCart', addToCartSchema);

module.exports = AddToCart;
