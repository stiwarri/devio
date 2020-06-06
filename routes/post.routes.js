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

// @route   GET /post/all
// @desc    Get all the posts
// @access  public
postRoutes.get('/all',
    postController.getAllPosts
);

// @route   DELETE /post/:id
// @desc    Delete the post by id
// @access  private
postRoutes.delete('/:id',
    checkAuthMiddleware,
    postController.deletePost
);

// @route   PATCH /post/like/:id
// @desc    Like the post by post id
// @access  private
postRoutes.patch('/like/:id',
    checkAuthMiddleware,
    postController.likePost
);

// @route   PATCH /post/dislike/:id
// @desc    Dislike the post by post id
// @access  private
postRoutes.patch('/dislike/:id',
    checkAuthMiddleware,
    postController.dislikePost
);

module.exports = postRoutes;