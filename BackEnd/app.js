const express = require('express');
const app = express();

const morgan = require('morgan');
const productRouter = require('./routes/productRoutes');
const voteRouter = require(`./routes/voteRoutes`);
const userRouter = require(`./routes/userRoutes`);
const reviewRouter = require(`./routes/reviewRoutes`);
const certificateRouter = require(`./routes/certificationRoutes`);
const orderRouter = require('./routes/orderRoutes');
const expertApplyRouter = require('./routes/expertApplyRoutes');
const schedule = require('node-schedule');
const addToCartRouter = require('./routes/addToCartRoutes');
const errorController = require('./controller/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const User = require('./models/userModel');
const Product = require('./models/productModel');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/img', express.static('public/img'));

app.use(
  cors({
    origin: 'http://localhost:5173', // replace with your URL
    credentials: true,
    methods: 'GET,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Setting HTTP headers
app.use(helmet());

//limiting IP requests with this middleware to avoid DOS & brute force attacks
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, Please try again after an hour!',
});

app.use('/api', limiter);

//Data sanitization against noSql queries injection
app.use(mongoSanitize());
//Data sanitization against XSS
app.use(xss());
//prevent parameter pollution
app.use(
  hpp({
    whitelist: ['ratingsQuantity', 'ratingsAverage', 'price'],
  })
);
//bodyParser, reading data from body into req.body
app.use(express.json({ limit: '50kb' }));

//serving static files
// app.use(express.static(`${__dirname}/public`));

//checking expetrs activity
// Schedule a task to run at the start of every 10 minutes
const expertJob = schedule.scheduleJob('*/10 * * * *', async () => {
  // Retrieve all users with the 'expert' role
  const experts = await User.find({ role: 'expert' });

  // Get the current time
  const currentTime = new Date();

  // Check each expert's voting activity every 10 minutes
  for (const expert of experts) {
    // Check if the expert has voted in the last 10 minutes
    const timeDifference = (currentTime - new Date(expert.lastVoted)) / 60000; // difference in minutes

    if (timeDifference > 10) {
      // Downgrade the user's role if they haven't voted in the last 10 minutes
      expert.role = 'user';
      await expert.save({ validateBeforeSave: false });
      console.log(
        `Expert ${expert.name} has been downgraded to a regular user due to insufficient voting activity.`
      );
    }
  }
});

//Check if the user is still eligible for the badge
const certificateJob = schedule.scheduleJob('*/5 * * * *', async () => {
  // Retrieve all users who are currently certified
  const certifiedUsers = await User.find({ isCertified: true });

  for (const user of certifiedUsers) {
    // Count the number of non-harmful products sold by the user
    const count = await Product.countDocuments({
      owner: user._id,
      harmfultoenv: false,
      soldNum: { $gte: 1 },
    });

    // If the user has less than 1 non-harmful product, set isCertified to false
    if (count < 1) {
      user.isCertified = false;
      await user.save({ validateBeforeSave: false });
      console.log(
        `User ${user.name} is no longer certified due to insufficient non-harmful products.`
      );
    }
  }
});

app.use('/api/v1/products', productRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/votes', voteRouter);
app.use('/api/v1/addToCart', addToCartRouter);
app.use('/api/v1/myOrders', orderRouter);
app.use('/api/v1/applyCertificate', certificateRouter);
app.use('/api/v1/expertApply', expertApplyRouter);

app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on the server`,
  });
  next();
});

app.use(errorController);

module.exports = app;
