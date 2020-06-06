const { validationResult } = require('express-validator');

const Post = require('../models/Post');
const User = require('../models/User');
const { createError } = require('../utils/app-helper');

exports.createPost = async (req, res, next) => {
    try {
        // handle validations result
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            throw createError(422, 'Validation failed', validationErrors.array());
        }
        // get users name, avatar and comments from req
        const user = await User.findById(req.user.id).select('-password');
        const text = req.body.text;
        // create post object, update users post property
        const post = new Post({
            user,
            name: user.name,
            avatar: user.avatar,
            text
        });
        user.posts.unshift(post);
        // save post object, save user object
        const savedPost = await post.save();
        await user.save();
        res.status(201).json({
            message: 'Post added successfully',
            post: savedPost
        });
    } catch (err) {
        console.log(err.message);
        next(err);
    }
};