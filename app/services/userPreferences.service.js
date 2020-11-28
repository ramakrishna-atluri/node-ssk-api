const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../helpers/db');
const UserPreferences = db.UserPreferences;
const User = db.User;

module.exports = {
    createPreference,
    getPreferences,
    updatePreference,
    delete: _delete
};


async function createPreference(preferenceParam) {
    const userPreference = new UserPreferences(preferenceParam);
    const user = await User.findOne({userId : preferenceParam.userId});
    user.profileCompletePercentage += 5;
    if(user.profileCompletePercentage === 100){
        user.isProfileComplete = true;
    }
    await user.save();
    // save preference
    await userPreference.save();
}

async function getPreferences(preferenceParam) {
    //validate
    return await UserPreferences.find({ email: preferenceParam.userId });
}

async function updatePreference(preferenceParam) {
    const userPreferenceParams = await UserPreferences.findOne({ userId: preferenceParam.userId });

    if (!userPreferenceParams) throw 'User Preferences not found';
    
    // copy profileParam properties to user profile
    Object.assign(userPreferenceParams, preferenceParam);
    await userPreferenceParams.save();
}


async function _delete(id) {
    await User.findByIdAndRemove(id);
}



