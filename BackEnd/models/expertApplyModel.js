const mongoose = require('mongoose');

const expertApplySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  question1: {
    type: String,
    required: [true, 'An answer to the question is needed!'],
  },
  question2: {
    type: String,
    required: [true, 'An answer to the question is needed!'],
  },
  question3: {
    type: String,
    required: [true, 'An answer to the question is needed!'],
  },
  question4: {
    type: String,
    required: [true, 'An answer to the question is needed!'],
  },
  question5: {
    type: String,
    required: [true, 'An answer to the question is needed!'],
  },
  question6: {
    type: String,
    required: [true, 'An answer to the question is needed!'],
  },
  question7: {
    type: String,
    required: [true, 'An answer to the question is needed!'],
  },

  question8: {
    type: String,
    required: [true, 'An answer to the question is needed!'],
  },
  question9: {
    type: String,
    required: [true, 'An answer to the question is needed!'],
  },
  question10: {
    type: String,
    required: [true, 'An answer to the question is needed!'],
  },
  // Background / qualification questions (added with the reviewer vs
  // commenter model): the original ten are all process questions, with
  // nothing about who the applicant is or why they qualify.
  question11: {
    type: String,
    required: [true, 'An answer to the question is needed!'],
  },
  question12: {
    type: String,
    required: [true, 'An answer to the question is needed!'],
  },
  question13: {
    type: String,
    required: [true, 'An answer to the question is needed!'],
  },
  applicationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
});

expertApplySchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name email active photo',
  });
  next();
});

const ExpertApply = mongoose.model('ExpertApply', expertApplySchema);

module.exports = ExpertApply;
