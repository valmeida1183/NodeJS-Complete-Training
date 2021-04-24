const express = require('express');
const { check, body } = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/mongoDb/user');

const router = express.Router();

router.get('/login', authController.getLogin);
router.get('/signup', authController.getSignup);
router.get('/reset', authController.getReset);
router.get('/reset/:token', authController.getNewPassword);

router.post(
    '/login',
    [
        body('email')
            .isEmail()
            .withMessage('Plase enter a valid email.')
            .custom((value, { req }) => {
                return User.findOne({ email: value }).then(user => {
                    if (!user) {
                        return Promise.reject('Invalid email or password.');
                    }
                });
            })
            .normalizeEmail(),
        body('password', 'Please enter a password with only numbers and text and at least 5 characters.')
            .isLength({ min: 5 })
            .isAlphanumeric()
            .trim(),
    ],
    authController.postLogin
);
router.post(
    '/signup',
    [
        check('name').notEmpty().withMessage('Name is required.'),
        check('email')
            .isEmail()
            .withMessage('Plase enter a valid email.')
            .custom((value, { req }) => {
                return User.findOne({ email: value }).then(user => {
                    if (user) {
                        return Promise.reject('Email exists already, please pick a different one.');
                    }
                });
            })
            .normalizeEmail(),
        //Outra forma de fazer a validação, com body, somente o valor de 'password' oriundo do body será validado.
        body('password', 'Please enter a password with only numbers and text and at least 5 characters.')
            .isLength({ min: 5 })
            .isAlphanumeric()
            .trim(),
        body('confirmPassword')
            .custom((value, { req }) => {
                // exemplo simples de um custom validator
                if (value !== req.body.password) {
                    throw new Error('Password have to match!');
                }
            })
            .trim(),
    ],
    authController.postSignup
);
router.post('/logout', authController.postLogout);
router.post('/reset', authController.postReset);
router.post('/new-password', authController.postNewPassword);

module.exports = router;
