// src/app.js
// modifications to src/app.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const passport = require('passport');

const authenticate = require('../src/authorization/');
const { createErrorResponse } = require('../src/response');
// version and author from our package.json file

const logger = require('./logger');
const pino = require('pino-http')({
  // Use our default logger instance, which is already configured
  logger,
});

// Create an express app instance we can use to attach middleware and HTTP routes
const app = express();

// Use logging middleware
app.use(pino);

// Use security middleware
app.use(helmet());

// Use CORS middleware so we can make requests across origins
app.use(cors());

// Use gzip/deflate compression middleware
app.use(compression());

// Set up our passport authentication middleware
passport.use(authenticate.strategy());
app.use(passport.initialize());

// modifications to src/app.js

// Remove `app.get('/', (req, res) => {...});` and replace with:

// Define our routes
app.use('/', require('./routes'));

// Add 404 middleware to handle any requests for resources that can't be found
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    error: {
      message: 'not found',
      code: 404,
    },
  });
});

// Add error-handling middleware to deal with anything else
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  let status;

  const message = err.message || 'unable to process request';
  if (message === 'Invalid type') {
    status = 415;
  } else if (message === 'Invalid size value' || message === 'Missing ownerId or type') {
    status = 400;
  } else if (
    message === 'Error: Fragment does not exist.' ||
    message === 'unable to read fragment data'
  ) {
    status = 404;
  } else status = err.status || 500;
  if (status > 499) {
    logger.error({ err }, `Error processing request`);
  }

  res.status(status).json(createErrorResponse(status, message));
});

// Export our `app` so we can access it in server.js
module.exports = app;
