const express = require('express');
const { body } = require('express-validator');

const profileRoutes = express.Router();
const profileController = require('../controllers/profile.controller');
const checkAuthMiddleware = require('../middlewares/check-auth');

// @route   GET /profile
// @desc    Get logged-in user's profile
// @access  private
profileRoutes.get('/',
    checkAuthMiddleware,
    profileController.getProfile);

// @route   POST /profile
// @desc    Create logged-in user's profile
// @access  private
profileRoutes.post('/',
    checkAuthMiddleware,
    [
        body('expertiseLevel')
            .trim()
            .not().isEmpty().withMessage('Expertise level is required'),
        body('skills')
            .trim()
            .not().isEmpty().withMessage('Skills are required')
    ],
    profileController.createProfile);

module.exports = profileRoutes;