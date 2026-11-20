// Shared helpers used by more than one controller.
//
// filterObj and the multer upload setup used to be copy-pasted in both
// handlerFactory.js and userController.js, and the copies had already
// drifted (see the note on filterObj's call form below).

// Keep only the listed fields from an object (e.g. a request body).
// Fields must be passed as separate arguments:
//
//   filterObj(req.body, 'name', 'email', 'photo')
//
// NOT as a single array — filterObj(req.body, ['name', 'email']) would
// look for a field literally named "name,email" and match nothing, so
// the filtered object would come back empty. That is exactly the bug
// updateMe / createUser / updateMyReviewOrVote had on the
// perf/p0-scalability branch: they passed an array, so updates were
// silently no-ops and admin user creation failed validation.
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

const multer = require('multer');
const AppError = require('./appError');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image!...Please upload an image', 400), false);
  }
};

// One shared upload instance. Callers pick the shape they need:
// upload.single('photo') (userController) or upload.fields([...])
// (handlerFactory.uploadImgs).
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

module.exports = { filterObj, multerStorage, multerFilter, upload };
