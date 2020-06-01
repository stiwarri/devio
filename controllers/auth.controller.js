const bcrypt = require('bcryptjs');
const config = require('config');
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
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
            id: savedUser._id.toString()
        });
    }
    catch (err) {
        console.log(err.message);
        next(err);
    }
};

exports.signIn = async (req, res, next) => {
    try {
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            throw createError(422, 'Validations failed!', validationErrors.array());
        }

        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            throw createError(401, 'User with this e-mail ID doesn\'t exist!');
        }

        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            throw createError(401, 'Password is incorrect!');
        }

        const token = jwt.sign(
            {
                id: user._id
            },
            config.get('jwtSecretKey'),
            {
                expiresIn: '1h'
            }
        );
        res.status(200).json({
            token,
            id: user._id.toString(),
            name: user.name
        });
    }
    catch (err) {
        console.log(err.message);
        next(err);
    }
};