const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const productRouter = require('./routes/productRoutes');

const app = express();

//1) MIDDLEWARE

// Set security http headers
app.use(helmet());
// Development logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Body parser, reading data from body to req.body
app.use(express.json());

// Data sanitization against no sql querry injection
app.use(mongoSanitize());

// Data sanitization against xss
app.use(xss());

// Prevent parameter pollution
app.use(hpp({ whitelist: ['price'] }));

// 2) ROUTES
app.use('/api/v1/products', productRouter);

module.exports = app;
