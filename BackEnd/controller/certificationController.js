// The Certification model file was renamed from the misspelled
// certfifcationModel.js. Required for its side effect only (registering
// the model with Mongoose); this controller does not itself create
// Certification documents — certification is stored as User.isCertified.
require('./../models/certificationModel');
const User = require('./../models/userModel');
const Product = require('./../models/productModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');
const nodeHtmlToImage = require('node-html-to-image');
const fs = require('fs');
const path = require('path');

const checkIfCanApply = async function (userId) {
  const count = await Product.countDocuments({
    owner: userId,
    harmfultoenv: false,
    soldNum: { $gte: 1 },
  });

  return count >= 1;
};

// Render the certificate HTML from the template file, filling in the
// placeholders. (Values are interpolated exactly as the old inline
// template literal did — no escaping was added; see the note in the
// report.)
const buildCertificateHtml = (user) =>
  fs
    .readFileSync(
      path.join(__dirname, '..', 'dev-data', 'templates', 'certificate.html'),
      'utf8'
    )
    .replace(/{{userName}}/g, user.name)
    .replace(/{{userEmail}}/g, user.email)
    .replace(/{{date}}/g, new Date().toISOString().split('T')[0]);

exports.applyCertification = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const isEligible = await checkIfCanApply(req.user.id);

  if (!isEligible) {
    return next(
      new AppError(
        "You can't apply for certification, please sell more environmentally friendly products ",
        400
      )
    );
  }

  user.isCertified = true;
  await user.save({ validateBeforeSave: false });

  // No response here, and no next() after a response. This handler is
  // chained with sendCertification in certificationRoutes.js, which
  // sends the 200 — the old code sent the response here and then called
  // next(), so the certificate email only happened as a side effect
  // after the response had already gone out.
  next();
});

exports.sendCertification = catchAsync(async (req, res, next) => {
  // Respond first, exactly as the old flow did (the client got its 200
  // from applyCertification before the image / email work started).
  // The certificate image is then generated and emailed in the
  // background; a failure there is logged server-side only, since the
  // client has already been told the certification succeeded.
  res.status(200).json({
    status: 'success',
  });

  const certificate = buildCertificateHtml(req.user);

  // Options for image generation
  const options = {
    puppeteerArgs: {
      // Adjust viewport size to fit content (not guaranteed to work in all cases)
      defaultViewport: {
        width: 800,
        height: 800,
      },
    },
  };

  // Convert HTML to image
  nodeHtmlToImage({
    html: certificate,
    output: `${__dirname}/../dev-data/img/CertificateImage.jpeg`,
    type: 'jpeg',
    ...options,
  })
    .then(async () => {
      await new Email(req.user, '').sendCertificate();
    })
    .catch((err) => {
      console.error('Error creating certificate image:', err);
    });
});
