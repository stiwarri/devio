const { validationResult } = require('express-validator');

const Comment = require('../models/Comment');
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

        // get user's name, avatar and comment's text from request
        const user = await User.findById(req.user.id).select('-password');
        const text = req.body.text;

        // create post object and update user's post property
        const post = new Post({
            user: req.user.id,
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
        const post = await Post.findById(req.params.postId);
        if (!post) {
            throw createError(404, 'Post not found');
        }

        // check if the user had created the post
        if (post.user.toString() !== req.user.id) {
            throw createError(403, 'Not authorized to delete the post');
        }

        // delete the post object from Posts collection
        const deletedPost = await Post.findOneAndRemove({ _id: req.params.postId });
        if (!deletedPost) {
            throw createError(404, 'Post not found');
        }

        // get user object, delete the post from user object and save it
        const user = await User.findById(req.user.id);
        user.posts = user.posts.filter(p => p._id.toString() !== req.params.postId);
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
        const post = await Post.findById(req.params.postId);
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
        const post = await Post.findById(req.params.postId);
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

exports.addComment = async (req, res, next) => {
    try {
        // handle validations result
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            throw createError(422, 'Validations failed', validationErrors.array());
        }

        // get user ID, post ID, comment's parent ID and text from request; post, user object from DB
        const userId = req.user.id;
        const postId = req.params.postId;
        const parentCommentId = req.body.parentCommentId;
        const commentText = req.body.text;
        const post = await Post.findById(postId);
        if (!post) {
            throw createError(404, 'Post not found');
        }
        const user = await User.findById(userId).select('name avatar');

        // create new comment
        const newComment = new Comment({
            parentId: parentCommentId,
            user: userId,
            name: user.name,
            avatar: user.avatar,
            text: commentText
        });

        // recursively update comment property of post object and save post object
        let found = false;
        const addRecursively = async comments => {
            try {
                for (let comment of comments) {
                    if (comment._id.toString() === parentCommentId) {
                        found = true;
                        const savedComment = await newComment.save();
                        const com = await Comment.findById(parentCommentId);
                        com.comments.unshift(savedComment._id);
                        await com.save();
                    }
                    else {
                        await addRecursively(comment.comments);
                    }
                }
            } catch (err) {
                console.log(err.message);
                next(err);
            }
        }
        if (!parentCommentId) {
            const savedComment = await newComment.save();
            post.comments.unshift(savedComment);
        }
        else {
            await addRecursively(post.comments);
            if (!found) {
                throw createError(404, 'Parent comment not found');
            }
        }
        await post.save();
        res.status(201).json({
            message: 'Comment added successfully'
        });
    } catch (err) {
        console.log(err.message);
        if (err.kind === 'ObjectId') {
            next(createError(404, 'Post not found'));
        }
        else {
            next(err);
        }
    }
};

exports.deleteComment = async (req, res, next) => {
    try {
        // handle validations result
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            throw createError(422, 'Validations failed', validationErrors.array());
        }

        // get post ID, comment ID from req and post, comment and user objects from DB
        const userId = req.user.id;
        const postId = req.params.postId;
        const commentId = req.body.commentId;
        const parentCommentId = req.body.parentCommentId;
        const post = await Post.findById(postId);
        if (!post) {
            throw createError(404, 'Post not found');
        }
        const comment = await Comment.findById(commentId);
        if (!comment) {
            throw createError(404, 'Comment not found');
        }

        // check if user is authorized to delete comment
        if (comment.user.toString() !== userId) {
            throw createError(403, 'Unauthorized to delete comment');
        }

        // remove comment and its children from comments collection
        await Comment.findByIdAndRemove(commentId);
        await Comment.remove({ parentId: commentId });

        // recursively find comment in post object, remove it and save post object
        let found = false;
        const deleteRecursively = async comments => {
            for (let comment of comments) {
                if (comment._id.toString() === parentCommentId) {
                    found = true;
                    comment.comments = comment.comments.filter(c => c._id.toString() !== commentId);
                }
                else {
                    await deleteRecursively(comment.comments);
                }
                if (found) break;
            }
        };
        if (!parentCommentId) {
            post.comments = post.comments.filter(c => c._id !== commentId);
        }
        else {
            await deleteRecursively(post.comments);
            if (!found) {
                throw createError(404, 'Parent comment not found');
            }
        }
        await post.save();
        res.status(200).json({
            message: 'Comment deleted successfully'
        });
    } catch (err) {
        console.log(err.message);
        if (err.kind === 'ObjectId') {
            next(createError(404, 'Post not found'));
        }
        else {
            next(err);
        }
    }
};