const express = require('express');

const postsRoutes = express.Router();

// @route   GET /posts
// @desc    Test posts routes
// @access  public
postsRoutes.get('/', (req, res, next) => {
    res.send('Posts route');
});

module.exports = postsRoutes;