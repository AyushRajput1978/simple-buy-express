const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean'); // Not compatible with Express 5
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const productRouter = require('./routes/productRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/app-error');
const globalErrorHandler = require('./controller/errorController');

const app = express();

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
app.use('/api/v1/products', productRouter);
app.use('/api/v1/users', userRouter);

// 3. Catch-all for unmatched routes
app.all('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});
app.use(globalErrorHandler);

module.exports = app;
