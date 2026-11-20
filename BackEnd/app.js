const express = require('express');
const app = express();

const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const productRouter = require('./routes/productRoutes');
const voteRouter = require(`./routes/voteRoutes`);
const userRouter = require(`./routes/userRoutes`);
const reviewRouter = require(`./routes/reviewRoutes`);
const certificateRouter = require(`./routes/certificationRoutes`);
const orderRouter = require('./routes/orderRoutes');
const expertApplyRouter = require('./routes/expertApplyRoutes');
const addToCartRouter = require('./routes/addToCartRoutes');
const webhookRouter = require('./routes/webhookRoutes');
const errorController = require('./controller/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const compression = require('compression');

// Stripe webhook FIRST, before any body parser: Stripe's signature is
// computed over the raw request body, and the webhook router applies
// express.raw() itself. If express.json() ran first, signature
// verification would always fail. See routes/webhookRoutes.js.
app.use('/api/v1/webhooks/stripe', webhookRouter);

//bodyParser, reading data from body into req.body
// NOTE: the old code called express.json() twice — once here with no
// limit, and once later with limit '50kb'. Only the limited one remains.
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true }));
// Perf P0: gzip responses (JSON lists + static images). Registered before
// the static middleware and the routers so their responses are compressed too.
app.use(compression());
app.use('/img', express.static('public/img'));

// Health check for load balancers / Docker / uptime monitors. Not under
// /api, so it is not rate-limited, and it does not touch the database.
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Parse cookies so authController.protect can read the httpOnly `jwt`
// cookie set on login / signup. (cookie-parser was already a dependency
// but was never registered as middleware.)
app.use(cookieParser());

app.use(
  cors({
    // Configured via FRONTEND_URL in production; defaults to the Vite
    // dev server. The old value was hard-coded to localhost:5173.
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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

app.use('/api/v1/products', productRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/votes', voteRouter);
app.use('/api/v1/addToCart', addToCartRouter);
app.use('/api/v1/myOrders', orderRouter);
app.use('/api/v1/applyCertificate', certificateRouter);
app.use('/api/v1/expertApply', expertApplyRouter);

app.all('*', (req, res) => {
  // The old handler sent the 404 response AND called next(), so the
  // request continued into the error handler after a response had
  // already been sent ("Cannot set headers after they are sent").
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on the server`,
  });
});

app.use(errorController);

module.exports = app;
