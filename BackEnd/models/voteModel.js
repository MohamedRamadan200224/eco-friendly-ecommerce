const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: [true, 'Comment can not be empty!'],
    },
    report: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      // Date.now (the function) is evaluated per document. The old
      // `default: Date.now()` was evaluated once, when this file was
      // loaded, so every document got the server's start time.
      default: Date.now,
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Vote must be belonged to a product'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Vote must be belonged to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

voteSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  }).populate({
    path: 'product',
    select: 'name price',
  });
  next();
});

// One vote per user per product (see Review model for why the unique
// index, not just the application-level check, is the guarantee).
voteSchema.index({ product: 1, user: 1 }, { unique: true });

const Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote;
