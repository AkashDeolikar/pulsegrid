const express    = require('express');
const router     = express.Router();
const { register, login, getMe }           = require('../controllers/auth.controller');
const { updateProfile, changePassword }    = require('../controllers/auth.profile.controller');
const { authenticate }                     = require('../middleware/auth');
const { validateRegister, validateLogin }  = require('../middleware/validate');

// Existing
router.post('/register', validateRegister, register);
router.post('/login',    validateLogin,    login);
router.get('/me',        authenticate,     getMe);

// NEW
router.patch('/profile',  authenticate, updateProfile);
router.patch('/password', authenticate, changePassword);

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const { register, login, getMe } = require('../controllers/auth.controller');
// const { authenticate } = require('../middleware/auth');
// const { validateRegister, validateLogin } = require('../middleware/validate');

// router.post('/register', validateRegister, register);
// router.post('/login', validateLogin, login);
// router.get('/me', authenticate, getMe);

// module.exports = router;