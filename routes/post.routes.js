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

// @route   DELETE /post/:postId
// @desc    Delete the post by id
// @access  private
postRoutes.delete('/:postId',
    checkAuthMiddleware,
    postController.deletePost
);

// @route   PATCH /post/like/:postId
// @desc    Like the post by post id
// @access  private
postRoutes.patch('/like/:postId',
    checkAuthMiddleware,
    postController.likePost
);

// @route   PATCH /post/dislike/:postId
// @desc    Dislike the post by post id
// @access  private
postRoutes.patch('/dislike/:postId',
    checkAuthMiddleware,
    postController.dislikePost
);

// @route   POST /post/comment/add/:postId
// @desc    Comment on a post by post id
// @access  private
postRoutes.post('/comment/add/:postId',
    [
        checkAuthMiddleware,
        body('text')
            .trim()
            .not().isEmpty().withMessage('Comments text is empty')
    ],
    postController.addComment
);

// @route   POST /post/comment/delete/:postId
// @desc    Delete a comment on a post by post ID
// @access  private
postRoutes.post('/comment/delete/:postId',
    [
        checkAuthMiddleware,
        body('commentId')
            .trim()
            .not().isEmpty()
    ],
    postController.deleteComment
);

module.exports = postRoutes;