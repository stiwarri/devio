const { validationResult } = require('express-validator');
const normalize = require('normalize-url');

const Profile = require('../models/Profile');
const { createError } = require('../utils/app-helper');

exports.getProfile = async (req, res, next) => {
    try {
        const userId = req.id;
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
            user: req.id,
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

        let profile = await Profile.findOne({ user: req.id });
        if (profile) {
            profile = await Profile.findOneAndUpdate(
                { user: req.id },
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