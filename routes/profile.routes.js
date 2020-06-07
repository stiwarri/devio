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
    profileController.getProfile
);

// @route   POST /profile
// @desc    Create logged-in user's profile
// @access  private
profileRoutes.post('/',
    [
        checkAuthMiddleware,
        body('expertiseLevel')
            .trim()
            .not().isEmpty().withMessage('Expertise level is required'),
        body('skills')
            .trim()
            .not().isEmpty().withMessage('Skills are required')
    ],
    profileController.createProfile
);

// @route   DELETE /profile
// @desc    Delete profile, user & all posts of logged-in user   
// @access  private
profileRoutes.delete('/',
    checkAuthMiddleware,
    profileController.deleteProfile
);

// @route   GET /profile/all
// @desc    Get profiles of all users    
// @access  public
profileRoutes.get('/all',
    profileController.getAllProfiles
);

// @route   GET /profile/:userId
// @desc    Get profile of a single user by id    
// @access  public
profileRoutes.get('/:userId',
    profileController.getUserProfile
);

// @route   POST /profile/experience
// @desc    Add experience to user profile    
// @access  private
profileRoutes.post('/experience',
    [
        checkAuthMiddleware,
        body('title')
            .trim()
            .not().isEmpty().withMessage('Title is required'),
        body('company')
            .trim()
            .not().isEmpty().withMessage('Company is required'),
        body('location')
            .trim()
            .not().isEmpty().withMessage('Location is required'),
        body('from')
            .trim()
            .not().isEmpty().withMessage('From is required')
    ],
    profileController.addWorkExperience
);

// @route   DELETE /profile/experience/:workExpId
// @desc    Delete experience from user profile by work-experience ID 
// @access  private
profileRoutes.delete('/experience/:workExpId',
    checkAuthMiddleware,
    profileController.deleteWorkExperience
);

// @route   POST /profile/education
// @desc    Add education to user's profile
// @access  private
profileRoutes.post('/education',
    [
        checkAuthMiddleware,
        body('school')
            .trim()
            .not().isEmpty().withMessage('School is required'),
        body('degree')
            .trim()
            .not().isEmpty().withMessage('Degree is required'),
        body('fieldOfStudy')
            .trim()
            .not().isEmpty().withMessage('Field Of Study is required'),
        body('from')
            .trim()
            .not().isEmpty().withMessage('From is required')
    ],
    profileController.addEducation
);

// @route   DELETE /profile/education/:eduId
// @desc    Delete education from user profile by education ID 
// @access  private
profileRoutes.delete('/education/:eduId',
    checkAuthMiddleware,
    profileController.deleteEducation
);

// @route   GET /profile/github/:username
// @desc    Get github repos by github username
// @access  public
profileRoutes.get('/github/:username',
    profileController.getGithubRepos
);

module.exports = profileRoutes;