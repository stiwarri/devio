const express = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/auth.controller');
const User = require('../models/User');

const authRoutes = express.Router();

// @route   POST /auth/sign-up
// @desc    Register (sign-up) user
// @access  public
authRoutes.post('/sign-up',
    [
        body('name')
            .trim()
            .not().isEmpty().withMessage('Name is required!'),
        body('email')
            .trim()
            .not().isEmpty().withMessage('Email is required!')
            .isEmail().withMessage('Enter a valid e-mail address!')
            .custom(async (value, { req }) => {
                try {
                    const existingEmail = await User.findOne({ email: value });
                    if (existingEmail) {
                        return Promise.reject('Email already exists!');
                    }
                }
                catch (err) {
                    return Promise.reject('Error checking existence of e-mail!');
                }
            })
            .normalizeEmail(),
        body('password')
            .trim()
            .not().isEmpty().withMessage('Password is required!')
            .isLength({ min: 5 }).withMessage('Password should be atleast 5 characters long!')
    ],
    authController.signUp
);

module.exports = authRoutes;