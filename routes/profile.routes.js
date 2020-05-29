const express = require('express');

const profileRoutes = express.Router();

// @route   GET /profile
// @desc    Test profile routes
// @access  public
profileRoutes.get('/', (req, res, next) => {
    res.send('Profile route');
});

module.exports = profileRoutes;