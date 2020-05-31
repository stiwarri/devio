const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');
const { validationResult } = require('express-validator');

const User = require('../models/User');
const { createError } = require('../utils/app-helper');

exports.signUp = async (req, res, next) => {
    try {
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            throw createError(422, 'Validations failed!', validationErrors.array());
        }

        const { name, email, password } = req.body;
        const avatar = gravatar.url(email, {
            s: 200,
            r: 'pg',
            d: 'mm'
        });
        const user = new User({
            name,
            email,
            password,
            avatar
        });
        const hashedPassword = await bcrypt.hash(password, 12);
        user.password = hashedPassword;
        const savedUser = await user.save();
        if (!savedUser) {
            throw createError(500, 'Couldn\'t create user!', err);
        }
        res.status(201).json({
            message: 'User created successfully.',
            userId: savedUser._id
        });
    }
    catch (err) {
        next(createError(500, 'Error creating user!', err));
    }
};