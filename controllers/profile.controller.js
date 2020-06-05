const { validationResult } = require('express-validator');
const normalize = require('normalize-url');

const Profile = require('../models/Profile');
const User = require('../models/User');
const { createError } = require('../utils/app-helper');

exports.getProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userProfile = await Profile.findById(userId).populate('user', ['name', 'avatar']);
        if (!userProfile) {
            throw createError(404, 'Profile not found');
        }
        res.status(200).json(profile);
    }
    catch (err) {
        console.log(err.message);
        next(err);
    }
};

exports.createProfile = async (req, res, next) => {
    try {
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            throw createError(422, 'Validations failed', validationErrors.array());
        }
        const {
            organization,
            website,
            location,
            expertiseLevel,
            status,
            skills,
            bio,
            githubUserName,
            youtube,
            twitter,
            instagram,
            linkedin,
            facebook
        } = req.body;
        const profileFields = {
            user: req.user.id,
            organization,
            website: website && website !== '' ? normalize(website, { forceHttps: true }) : '',
            location,
            expertiseLevel,
            status,
            skills: Array.isArray(skills)
                ? skills
                : skills.split(',').map(skill => skill.trim()),
            bio,
            githubUserName
        };
        const socialFields = { youtube, twitter, instagram, linkedin, facebook };
        for (const [key, value] of Object.entries(socialFields)) {
            if (value && value.length > 0)
                socialFields[key] = normalize(value, { forceHttps: true });
            else
                socialFields[key] = '';
        }
        profileFields.social = socialFields;

        let profile = await Profile.findOne({ user: req.user.id });
        if (profile) {
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true, upsert: true, useFindAndModify: false }
            );
            res.status(200).json({
                message: 'Profile updated successfully',
                profile
            });
        } else {
            profile = new Profile(profileFields);
            await profile.save();
            res.status(201).json({
                message: 'Profile created successfully',
                profile
            });
        }
    }
    catch (err) {
        console.log(err.message);
        next(err);
    }
};

exports.getAllProfiles = async (req, res, next) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        if (!profiles) {
            throw createError(404, 'No profile found');
        }
        res.status(200).json(profile);
    }
    catch (err) {
        console.log(err.message);
        next(err);
    }
};

exports.getUserProfile = async (req, res, next) => {
    try {
        const profile = await Profile.findOne({ user: req.params.id }).populate('user', ['name', 'avatar']);
        if (!profile) {
            throw createError(404, 'Profile not found');
        }
        res.status(200).json(profile);
    }
    catch (err) {
        console.log(err.message);
        next(err);
    }
};

exports.deleteProfile = async (req, res, next) => {
    try {
        await Profile.findOneAndRemove({ user: req.user.id });
        await User.findOneAndRemove({ _id: req.user.id });
        res.status(200).json({
            message: 'User\'s profile deleted successfully'
        })
    }
    catch (err) {
        console.log(err.message);
        next(err);
    }
};

exports.addWorkExperience = async (req, res, next) => {
    try {
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            throw createError(422, 'Validations failed', validationErrors.array());
        }
        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        } = req.body;
        const profile = await Profile.findOne({ user: req.user.id });
        if (!profile) {
            throw createError(404, 'Profile not found', validationErrors.array());
        }
        profile.workExperience.unshift({
            title,
            company,
            location,
            from,
            to,
            current,
            description
        });
        const updatedProfile = await profile.save();
        if (!updatedProfile) {
            throw createError(500, 'Couldn\'t update profile experience');
        }
        res.status(200).json({
            message: 'Work experience added successfully',
            profile: updatedProfile
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

exports.deleteWorkExperience = async (req, res, next) => {
    try {
        const workExpId = req.params.id;
        const profile = await Profile.findOne({ user: req.user.id });
        if (!profile) {
            throw createError(404, 'Profile not found');
        }
        profile.workExperience = profile.workExperience.filter(exp => exp._id.toString() !== workExpId);
        const updatedProfile = await profile.save();
        if (!updatedProfile) {
            throw createError(500, 'Couldn\'t delete experience');
        }
        res.status(200).json({
            message: 'Work experience deleted successfully'
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

exports.addEducation = async (req, res, next) => {
    try {
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            throw createError(422, 'Validation failed', validationErrors.array());
        }
        const {
            school,
            degree,
            fieldOfStudy,
            from,
            to,
            current,
            description
        } = req.body;
        const profile = await Profile.findOne({ user: req.user.id });
        profile.education.unshift({
            school,
            degree,
            fieldOfStudy,
            from,
            to,
            current,
            description
        });
        const updatedProfile = await profile.save();
        res.status(201).json({
            message: 'Education details added successfully',
            profile: updatedProfile
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

exports.deleteEducation = async (req, res, next) => {
    try {
        const eduId = req.params.id;
        const profile = await Profile.findOne({ user: req.user.id });
        profile.education = profile.education.filter(edu => edu._id.toString() !== eduId);
        await profile.save();
        res.status(200).json({
            message: 'Education details deleted successfully'
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};