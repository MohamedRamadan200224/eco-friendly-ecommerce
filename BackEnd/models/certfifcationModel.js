const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

certificationSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo email',
  });
  next();
});

const Certification = mongoose.model('Certification', certificationSchema);

module.exports = Certification;
