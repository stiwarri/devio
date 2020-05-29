const express = require('express');

const authRoutes = express.Router();

// @route   GET /auth
// @desc    Test auth routes
// @access  public
authRoutes.get('/', (req, res, next) => {
    res.send('Auth route');
});

module.exports = authRoutes;