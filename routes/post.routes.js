const express = require('express');
const { body } = require('express-validator');

const checkAuthMiddleware = require('../middlewares/check-auth');
const postController = require('../controllers/post.controller');

const postRoutes = express.Router();

// @route   POST /post
// @desc    Creates a post
// @access  private
postRoutes.post('/',
    [
        checkAuthMiddleware,
        body('text')
            .trim()
            .not().isEmpty().withMessage('Text is required')
    ],
    postController.createPost
);

module.exports = postRoutes;