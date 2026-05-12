const rateLimit = require('express-rate-limit');
const isDev = process.env.NODE_ENV !== 'production'; 

// General API: 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  // windowMs:  15 * 60 * 1000,
  // max:       100,
  // message:   { error: 'Too many requests, please try again later' },
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 100,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders:   false,
});

// Auth endpoints: 10 attempts per 15 minutes (brute-force protection)
const authLimiter = rateLimit({
  // windowMs:  15 * 60 * 1000,
  // max:       10,
  // message:   { error: 'Too many auth attempts, please try again later' },
  windowMs: 15 * 60 * 1000,
  max: isDev ? 100 : 10,
  message: { error: 'Too many auth attempts' },
  standardHeaders: true,
  legacyHeaders:   false,
});

// Publish endpoint: 60 events per minute per IP
const publishLimiter = rateLimit({
  windowMs: 60 * 1000,
  max:      60,
  message:  { error: 'Publish rate limit exceeded' },
});

module.exports = { apiLimiter, authLimiter, publishLimiter };