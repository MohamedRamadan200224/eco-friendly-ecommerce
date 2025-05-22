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
      default: Date.now(),
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

const Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote;
