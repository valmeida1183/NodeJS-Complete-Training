const express = require('express');
const authController = require('../controllers/auth');

const router = express.Router();

// login page
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.post('/logout', authController.postLogout);

module.exports = router;
