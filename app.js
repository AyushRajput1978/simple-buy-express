const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean'); // Not compatible with Express 5
const rateLimit = require('express-rate-limit');
const cors = require('cors');
// const productRouter = require('./routes/dashboard/productRoutes');
// const multer = require('multer');
const userRouter = require('./routes/website/userRoute');
const reviewRouter = require('./routes/reviewRoutes');
const publicRouter = require('./routes/website/publicRoutes');
const cartRouter = require('./routes/website/cartRoutes');
const paymentRouter = require('./routes/website/paymentRoutes');
const dashboardRoutes = require('./routes/dashboard/index');
const AppError = require('./utils/app-error');
const globalErrorHandler = require('./controller/errorController');
const paymentController = require('./controller/paymentController');
const uploadRouter = require('./routes/uploadRoute');

// const upload = multer();

const app = express();
// 1. Webhook - first and raw
app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.handleStripeWebhook
);
// 1. Global Middlewares

// Security HTTP headers
app.use(helmet());

// Enable CORS for all routes (adjust origin as needed)
app.use(cors());

// Logging in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter); // Apply to all /api routes

// Body parser: Reading data from body into req.body
// app.use((req, res, next) => {
//   const contentType = req.headers['content-type'];
//   if (contentType && contentType.includes('multipart/form-data')) {
//     upload.any()(req, res, next);
//   } else {
//     next();
//   }
// });

app.use(express.json({ limit: '10kb' })); // Limit body size

// Data sanitization against No SQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent HTTP param pollution
app.use(
  hpp({
    whitelist: ['price'], // whitelist common multi-query fields
  })
);

// 2. Routes
app.use('/api/v1/upload', uploadRouter);
// 2.1 website Routes
app.use('/api/v1', publicRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/payment', paymentRouter);
// 2.2 Dashboard Routes
app.use('/api/v1/dashboard', dashboardRoutes);

// 3. Catch-all for unmatched routes
app.all('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});
app.use(globalErrorHandler);

module.exports = app;
