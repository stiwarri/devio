const config = require('config');
const jwt = require('jsonwebtoken');

const { createError } = require('../utils/app-helper');

const checkAuthMiddleware = (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        if (!authHeader) {
            throw createError(401, 'Not authenticated!');
        }

        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, config.get('jwtSecretKey'));
        if (!decodedToken) {
            throw createError(401, 'Error occured while decoding token. Not authenticated!');
        }

        req.id = decodedToken.id;
        next();
    }
    catch (err) {
        next(err);
    }
};

module.exports = checkAuthMiddleware;