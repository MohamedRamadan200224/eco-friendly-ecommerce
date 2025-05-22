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
    default: new Date(),
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

const AddToCart = mongoose.model('AddToCart', addToCartSchema);

module.exports = AddToCart;
