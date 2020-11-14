const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../helpers/db');
const counterService = require('./counter.service');
const UserProfile = db.UserProfile;
const User = db.User;

module.exports = {
    getAll,
    getById,
    createProfile,
    updateProfile,
    getProfile,
    delete: _delete
};

async function createProfile(profileParam) {
    //validate

    const profile = new UserProfile(profileParam);
    const user = await User.findOne({ userId: profileParam.userId });
    
    // save profile
    user.profileComepletePercentage += 80;
    await user.save();
    await profile.save();
}

async function getProfile(profileParam) {
    //validate
    return await UserProfile.find({ email: profileParam.contactInfo.email });
}

async function updateProfile(profileParam) {
    const userProfile = await UserProfile.findOne({ userId: profileParam.userId });

    // validate
    if (!userProfile) throw 'User not found';
    
    // copy profileParam properties to user profile
    Object.assign(userProfile, profileParam);
    await userProfile.save();
}

async function getAll() {
    return await User.find();
}

async function getById(id) {
    return await User.findById(id);
}

async function _delete(id) {
    await User.findByIdAndRemove(id);
}



