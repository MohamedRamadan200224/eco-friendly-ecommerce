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

// Fields a client must never be able to set through a generic update.
// - password / passwordConfirm: only via /updateMyPassword or resetPassword
//   (which hash the password through the pre-save hook; findByIdAndUpdate
//   would store it in plain text).
// - role / isCertified / rewardPoints: privilege / trust state, server-only.
// - owner: ownership is decided by the server (req.user.id).
// - ratingsAverage / ratingsQuantity / soldNum / environmentalScore /
//   reportsNumber / noReportsNumber / harmfultoenv /
//   environmentalImpactAssessed: computed / aggregated server-side.
const FORBIDDEN_UPDATE_FIELDS = [
  'password',
  'passwordConfirm',
  'role',
  'isCertified',
  'rewardPoints',
  'owner',
  'ratingsAverage',
  'ratingsQuantity',
  'soldNum',
  'environmentalScore',
  'environmentalImpactAssessed',
  'reportsNumber',
  'noReportsNumber',
  'harmfultoenv',
];

// Same idea for generic creation, minus password/passwordConfirm/role:
// those are legitimately needed only by the dedicated admin user-creation
// handler (see userController.createUser), never by this generic factory.
const FORBIDDEN_CREATE_FIELDS = FORBIDDEN_UPDATE_FIELDS.filter(
  (field) => !['password', 'passwordConfirm', 'role'].includes(field)
);

const stripFields = (obj, forbiddenFields) => {
  const clean = { ...obj };
  forbiddenFields.forEach((field) => delete clean[field]);
  return clean;
};

// Expired sales are computed at read time only. A GET request must not
// silently write back to the database (the old code did `doc.save()` inside
// getOne / getAll). The in-memory copy sent to the client shows the
// restored price; expiring the sale in the DB belongs to a write path /
// scheduled job.
const applyExpiredSaleInMemory = (doc) => {
  if (doc && doc.onSale === true && Date.now() > doc.onsaleDuration) {
    doc.price = doc.originalPrice;
    doc.onSale = false;
    doc.onsaleDuration = null;
  }
  return doc;
};

exports.getMyProducts = (Model, modelType) =>
  catchAsync(async (req, res, next) => {
    // SECURITY: always use the authenticated user's id. The old code took
    // the owner id from req.params.id, so any caller could list another
    // user's products by guessing their id.
    const docs = await Model.find({
      owner: req.user.id,
    });

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        data: docs,
      },
    });
  });

exports.updateMyProduct = (Model, modelType, filteredBody) =>
  catchAsync(async (req, res, next) => {
    const allowedFields = filterObj(req.body, ...filteredBody);

    // SECURITY: the update only matches a document owned by the caller.
    // The old code used findByIdAndUpdate({_id}) with no owner filter, so
    // any authenticated seller could update anyone else's product.
    const updatedDoc = await Model.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.user.id,
      },
      allowedFields,
      {
        new: true,
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

    if (!offsaleProduct) {
      return next(new AppError('No product found with that ID', 404));
    }

    if (
      typeof req.body.price !== 'number' ||
      req.body.price <= 0 ||
      req.body.price > offsaleProduct.price
    ) {
      return next(
        new AppError(
          'The discount price must be a positive number and can not be higher than the old price!',
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

    if (!onsaleProduct) {
      return next(new AppError('No product found with that ID', 404));
    }

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
    // Only allow fields that belong on a review / vote. The old code passed
    // every supplied key through, including keys that do not exist on the
    // model.
    const allowedUpdate = filterObj(req.body, [
      'review',
      'rating',
      'comment',
      'report',
    ]);

    const doc = await Model.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      allowedUpdate,
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

exports.updateOne = (Model, allowedFields) =>
  catchAsync(async (req, res, next) => {
    // If the caller supplies an allowlist, use it; otherwise strip every
    // field a client must never set via a generic update (see
    // FORBIDDEN_UPDATE_FIELDS above).
    const updateData = allowedFields
      ? filterObj(req.body, ...allowedFields)
      : stripFields(req.body, FORBIDDEN_UPDATE_FIELDS);

    const doc = await Model.findByIdAndUpdate(req.params.id, updateData, {
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
      // Expired sale, computed at read time only (no DB write on a GET).
      applyExpiredSaleInMemory(doc);
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

    // Total matching documents (before pagination), so clients can build
    // real pagination instead of guessing from the page size.
    const total = await Model.countDocuments(filter);

    const docs = await features.query;

    if (modelType === 'product') {
      // The old code used docs.forEach(async ...) — the async callbacks
      // were never awaited, so the response could go out before the
      // (unwanted) saves finished. Sale expiry is now computed in memory
      // only, synchronously, before responding.
      docs.forEach((product) => applyExpiredSaleInMemory(product));
    }

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: docs.length,
      total,
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
    const allowedFields = filterObj(req.body, ...filteredBody);
    // Ownership is decided by the server, after filtering the body —
    // a client-supplied `owner` in req.body can never win.
    allowedFields.owner = req.user._id;

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

exports.createOne = (Model, modelType, allowedFields) =>
  catchAsync(async (req, res, next) => {
    // If the caller supplies an allowlist, use it; otherwise strip every
    // server-computed field (see FORBIDDEN_CREATE_FIELDS). Password and
    // role are not in that list: they are only accepted by the dedicated
    // admin user-creation handler, never through this generic factory.
    const createData = allowedFields
      ? filterObj(req.body, ...allowedFields)
      : stripFields(req.body, FORBIDDEN_CREATE_FIELDS);

    const doc = await Model.create(createData);
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
