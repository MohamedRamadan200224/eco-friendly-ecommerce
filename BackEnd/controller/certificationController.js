const Certification = require('./../models/certfifcationModel');
const User = require('./../models/userModel');
const Product = require('./../models/productModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');
const nodeHtmlToImage = require('node-html-to-image');

const checkIfCanApply = async function (userId) {
  const count = await Product.countDocuments({
    owner: userId,
    harmfultoenv: false,
    soldNum: { $gte: 1 },
  });

  if (count >= 1) {
    return true;
  } else {
    return false;
  }
};

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

  res.status(200).json({
    status: 'success',
  });
  next();
});

exports.sendCertification = catchAsync(async (req, res, next) => {
  let certificate = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: Arial, sans-serif;
                text-align: center;
            }
            .certificate {
                border: 15px solid #ccffcc;
                border-right: 15px solid #ccffcc;
                border-left: 15px solid #ccffcc;
                width: 700px;
                margin: 0 auto;
                padding: 20px;
            }
            .certificate h1 {
                font-size: 40px;
                color: #ccffcc;
                margin-top: 30px;
            }
            .certificate h2 {
                font-family: 'Satisfy', cursive;
                font-size: 24px;
                letter-spacing: 1px;
            }
            .certificate h3 {
                font-size: 18px;
                margin-top: 10px;
            }
        </style>
    </head>
    <body>
        <div class="certificate">
            <h1>Certificate of Completion</h1>
            <h2>This certificate is awarded to</h2>
            <h1 class="colorGreen">${req.user.name}</h1>
            <h3>For Being Non-Harmfull To Enviroment</h3>
            <p>Email: ${req.user.email}</p>
            <h3>Awarded on ${new Date().toISOString().split('T', 1)[0]}</h3>
        </div>
    </body>
    </html>
    `;

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
      console.log('Image created successfully');
      await new Email(req.user, '').sendCertificate();
    })
    .catch((err) => {
      console.error('Error creating image:', err);
      return next(new AppError("Couldn't create Certification image!", 400));
    });
});
