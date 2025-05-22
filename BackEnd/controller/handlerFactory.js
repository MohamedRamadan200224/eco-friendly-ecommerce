const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const multer = require('multer');
const sharp = require('sharp');
const User = require('./../models/userModel');
const Product = require('../models/productModel');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

exports.getMyProducts = (Model, modelType) =>
  catchAsync(async (req, res, next) => {
    if (!req.params.id) req.params.id = req.user.id;
    const docs = await Model.find({
      owner: req.params.id,
    });
    if (!docs) {
      return next(
        new AppError(`Couldn't find any ${modelType} of yours!`, 400)
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: docs,
      },
    });
  });

exports.updateMyProduct = (Model, modelType, filteredBody) =>
  catchAsync(async (req, res, next) => {
    const allowedFields = filterObj(req.body, ...filteredBody);

    const updatedDoc = await Model.findByIdAndUpdate(
      {
        _id: req.params.id,
      },
      allowedFields,
      {
        runValidators: true,
      }
    );

    if (!updatedDoc) {
      return next(
        new AppError(
          `Couldn't update the ${modelType} because it is either not yours or it is not found!`,
          400
        )
      );
    }
    updatedDoc.calculateEnvironmentalScore();
    if (updatedDoc.environmentalScore >= 10) {
      updatedDoc.harmfultoenv = false;
      updatedDoc.environmentalImpactAssessed = true;
    } else {
      updatedDoc.harmfultoenv = true;
      updatedDoc.environmentalImpactAssessed = true;
    }
    await updatedDoc.save();

    res.status(200).json({
      status: 'success',
      data: {
        data: updatedDoc,
      },
    });
  });

exports.deleteMyProduct = (Model, modelType) =>
  catchAsync(async (req, res, next) => {
    const deletedDoc = await Model.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!deletedDoc) {
      return next(
        new AppError(
          `Couldn't delete the ${modelType} because it is either not yours or it is not found!`,
          400
        )
      );
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image!...Please upload an image', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadImgs = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeImgs = (modelName) =>
  catchAsync(async (req, res, next) => {
    if (!req.files) return next();
    const date = new Date();
    //uploading image cover
    if (req.files.imageCover) {
      req.body.imageCover = `${req.user.name.split(' ', 1)[0]}-${
        req.body.category
      }-${req.user.id}-${Date.now()}-cover.jpeg`;

      await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/${req.body.category}/${req.body.imageCover}`);
    }

    //uploadimg images
    req.body.images = [];

    if (req.files.images) {
      await Promise.all(
        req.files.images.map(async (file, i) => {
          const filename = `${req.user.name}-${modelName}-${
            req.params.id
          }-${Date.now()}-${i + 1}.jpeg`;

          await sharp(req.files.images[i].buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(
              `public/img/${req.body.category.toLowerCase()}/${filename}`
            );

          req.body.images.push(filename);
        })
      );
    }
    next();
  });

exports.getProductUserIds = (req, res, next) => {
  //allow nested routes and send user & product data if not sent
  if (!req.body.user) req.body.user = req.user.id;
  if (!req.body.product) req.body.product = req.params.productId;
  next();
};

//OnSale a product
exports.activateDiscount = (Model) =>
  catchAsync(async (req, res, next) => {
    const offsaleProduct = await Model.findById(req.params.id);

    if (req.body.price > offsaleProduct.price) {
      return next(
        new AppError(
          'The discount price can not be higher than the old price!',
          400
        )
      );
    }

    if (offsaleProduct.onSale === true) {
      return next(
        new AppError('You had already made this product onsale!', 400)
      );
    }

    offsaleProduct.originalPrice = offsaleProduct.price;
    offsaleProduct.price = req.body.price;
    offsaleProduct.onSale = true;
    offsaleProduct.onsaleDuration =
      Date.now() + req.body.onsaleDuration * 24 * 60 * 60 * 1000;

    await offsaleProduct.save();

    res.status(200).json({
      status: 'success',
      data: {
        data: offsaleProduct,
      },
    });
  });

//OffSale a product
exports.deactivateDiscount = (Model) =>
  catchAsync(async (req, res, next) => {
    const onsaleProduct = await Model.findById(req.params.id);

    if (onsaleProduct.onSale !== true) {
      return next(new AppError('You had already removed the discount!', 400));
    }

    onsaleProduct.price = onsaleProduct.originalPrice;
    onsaleProduct.onSale = false;
    onsaleProduct.onsaleDuration = null;

    await onsaleProduct.save();

    res.status(200).json({
      status: 'success',
      data: {
        data: onsaleProduct,
      },
    });
  });

exports.deleteMyReviewOrVote = (Model) =>
  catchAsync(async (req, res, next) => {
    const docDeleted = await Model.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!docDeleted) {
      return next(
        new AppError("Couldn't delete this review or vote in DB!", 400)
      );
    }
    res.status(204).json({
      status: 'success',
      data: {
        data: null,
      },
    });
  });

exports.updateMyReviewOrVote = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        review: req.body.review,
        rating: req.body.rating,
        comment: req.body.comment,
        report: req.body.report,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!doc) {
      return next(
        new AppError(
          "You cant update a review or a vote which isn't yours in DB!",
          400
        )
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, modelType, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    if (modelType === 'product') {
      if (doc.onSale === true && Date.now() > doc.onsaleDuration) {
        doc.price = doc.originalPrice;
        doc.onSale = false;
        doc.onsaleDuration = null;

        await doc.save();
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model, modelType) =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on product (hack)
    let filter = {};
    if (req.params.productId) filter = { product: req.params.productId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const docs = await features.query;

    if (modelType === 'product') {
      docs.forEach(async (product) => {
        if (product.onSale === true && Date.now() > product.onsaleDuration) {
          product.price = product.originalPrice;
          product.onSale = false;
          product.onsaleDuration = null;
          await product.save();
        }
      });
    }

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        data: docs,
      },
    });
  });

//checks if the model (reviews,votes) are done before
exports.checkIfDoneBefore = (rateModel) =>
  catchAsync(async (req, res, next) => {
    const productIdFound = await Product.findById(req.body.product);

    if (!productIdFound) {
      return next(
        new AppError(
          'The ID of the product you are reviewing or voting was not found in DB!',
          400
        )
      );
    }

    const reviewedBefore = await rateModel.findOne({
      product: req.body.product,
      user: req.body.user,
    });

    if (reviewedBefore) {
      return next(
        new AppError('You have already reviewed or voted this product!', 400)
      );
    }
    next();
  });

exports.createMyProduct = (Model, filteredBody) =>
  catchAsync(async (req, res, next) => {
    req.body.owner = req.user._id;
    const allowedFields = filterObj(req.body, ...filteredBody);

    const doc = await Model.create(allowedFields);

    doc.calculateEnvironmentalScore();
    if (doc.environmentalScore >= 10) {
      doc.harmfultoenv = false;
      doc.environmentalImpactAssessed = true;
    } else {
      doc.harmfultoenv = true;
      doc.environmentalImpactAssessed = true;
    }
    await doc.save();

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model, modelType) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    if (modelType === 'product') {
      doc.calculateEnvironmentalScore();
      if (doc.environmentalScore >= 10) {
        doc.harmfultoenv = false;
        doc.environmentalImpactAssessed = true;
      } else {
        doc.harmfultoenv = true;
        doc.environmentalImpactAssessed = true;
      }
      await doc.save();
    }

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
