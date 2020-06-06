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

        // get user's name, avatar and comments from request
        const user = await User.findById(req.user.id).select('-password');
        const text = req.body.text;

        // create post object and update user's post property
        const post = new Post({
            user,
            name: user.name,
            avatar: user.avatar,
            text
        });
        user.posts.unshift(post);

        // save post object and save user object
        const savedPost = await post.save();
        await user.save();
        res.status(201).json({
            message: 'Post added successfully',
            post: savedPost
        });
    }
    catch (err) {
        console.log(err.message);
        next(err);
    }
};

exports.getAllPosts = async (req, res, next) => {
    try {
        // get all posts
        const posts = await Post.find().sort({ date: -1 });
        res.status(200).json(posts);
    }
    catch (err) {
        console.log(err.message);
        next(err);
    }
};

exports.deletePost = async (req, res, next) => {
    try {
        // find post and check if it exists
        const post = await Post.findById(req.params.id);
        if (!post) {
            throw createError(404, 'Post not found');
        }

        // check if the user had created the post
        if (post.user.toString() !== req.user.id) {
            throw createError(403, 'Not authorized to delete the post');
        }

        // delete the post object from Posts collection
        const deletedPost = await Post.findOneAndRemove({ _id: req.params.id });
        if (!deletedPost) {
            throw createError(404, 'Post not found');
        }

        // get user object, delete the post from user object and save it
        const user = await User.findById(req.user.id);
        user.posts = user.posts.filter(p => p._id.toString() !== req.params.id);
        await user.save();
        res.status(200).json({
            message: 'Post deleted successfully',
            post: deletedPost
        });
    }
    catch (err) {
        console.log(err.message);
        if (err.kind === 'ObjectId') {
            next(createError(404, 'Post not found'));
        }
        else {
            next(err);
        }
    }
};

exports.likePost = async (req, res, next) => {
    try {
        // get the post object and check if user has already liked the post
        const post = await Post.findById(req.params.id);
        const index = post.likes.findIndex(userObj => userObj.user.toString() === req.user.id);
        if (index !== -1) {
            throw createError(400, 'Post already liked');
        }

        // add user id to likes property of post object and save
        post.likes.unshift({ user: req.user.id });
        await post.save();
        res.status(200).json(post.likes);
    }
    catch (err) {
        console.log(err.message);
        if (err.kind === 'ObjectId') {
            next(createError(404, 'Post not found'));
        }
        else {
            next(err);
        }
    }
};

exports.dislikePost = async (req, res, next) => {
    try {
        // get the post object and check if user has already liked the post
        const post = await Post.findById(req.params.id);
        const index = post.likes.findIndex(userObj => userObj.user.toString() === req.user.id);
        if (index === -1) {
            throw createError(400, 'Post is not yet liked');
        }

        // remove user id from likes property of post object and save
        post.likes = post.likes.filter((userObj, idx) => idx !== index);
        await post.save();
        res.status(200).json(post.likes);
    }
    catch (err) {
        console.log(err.message);
        if (err.kind === 'ObjectId') {
            next(createError(404, 'Post not found'));
        }
        else {
            next(err);
        }
    }
};