const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../helpers/db');
const counterService = require('./counter.service');
const { UserPreferences } = require('../helpers/db');
const UserProfile = db.UserProfile;
const User = db.User;

module.exports = {
    getAll,
    getById,
    createProfile,
    updateProfile,
    blockProfile,
    unBlockProfile,
    getProfile,
    getMatches,
    saveMatches,
    delete: _delete
};

async function createProfile(profileParam) {
    //validate
    const user = await User.findOne({ userId: profileParam.userId });

    if (!user) {
        return 'Cannot find user';
    }

    let contactNumber = profileParam.contactInfo.contactNumber;
    if(contactNumber) {
        let arr = contactNumber.split(" ");
        const countryCode = arr.splice(0,1).join("");
        const phoneNumber = arr.join("").replace(' ', '').replace(/\d(?=\d{4})/g, "*");
        
        const maskedContactNumber = countryCode + phoneNumber;
        profileParam.contactInfo.contactNumber = countryCode + arr.join("");
        profileParam.contactInfo.maskedContactNumber = maskedContactNumber;

    }

    profileParam.contactInfo.email =  user.email;
    profileParam.contactInfo.maskedEmail = user.maskedEmail;
    const profile = new UserProfile(profileParam);    
    
    // save profile
    user.profileCompletePercentage += 80;
    if(user.profileCompletePercentage === 100){
        user.isProfileComplete = true;
    }
    await user.save();
    await profile.save();

    profile.contactInfo.contactNumber = profile.contactInfo.maskedContactNumber;
    profile.contactInfo.email = profile.contactInfo.maskedEmail;

    return profile;
}

async function getProfile(profileParam) {
    //validate
    return await UserProfile.find({ email: profileParam.contactInfo.email });
}

async function updateProfile(profileParam) {
    const userProfile = await UserProfile.findOne({ userId: profileParam.userId });

    // validate
    if (!userProfile) throw 'User not found';
    
    profileParam.contactInfo.contactNumber = userProfile.contactInfo.contactNumber;
    profileParam.contactInfo.email = userProfile.contactInfo.email;

    // copy profileParam properties to user profile
    Object.assign(userProfile, profileParam);
    await userProfile.save();

    userProfile.contactInfo.contactNumber = userProfile.contactInfo.maskedContactNumber;
    userProfile.contactInfo.email = userProfile.contactInfo.maskedEmail;

    return userProfile;
}

async function blockProfile(blockParam) {
    const userProfile = await UserProfile.findOne({ userId: blockParam.userId });
    const blockedProfile = await UserProfile.findOne({ userId: blockParam.blockId });
    // validate
    if (!blockedProfile) return 'Profile not found';
    
    if(userProfile.blockedProfiles.length > 0){
        for(var i=0;i<userProfile.blockedProfiles.length;i++){
            if( blockParam.blockId === userProfile.blockedProfiles[i].blockedId){
                return 'User already blocked';
            }else{
                userProfile.blockedProfiles.push({blockedId: blockParam.blockId, firstName: blockedProfile.basicInfo.firstName, lastName: blockedProfile.basicInfo.lastName});
                await userProfile.save();

                userProfile.contactInfo.contactNumber = userProfile.contactInfo.maskedContactNumber;
                userProfile.contactInfo.email = userProfile.contactInfo.maskedEmail;
                return userProfile;
            }
        }
    }else{
        userProfile.blockedProfiles.push({blockedId: blockParam.blockId, firstName: blockedProfile.basicInfo.firstName, lastName: blockedProfile.basicInfo.lastName});
        await userProfile.save();
        userProfile.contactInfo.contactNumber = userProfile.contactInfo.maskedContactNumber;
        userProfile.contactInfo.email = userProfile.contactInfo.maskedEmail;
        return userProfile;
    }
    
}

async function unBlockProfile(unBlockParam) {
    const userProfile = await UserProfile.findOne({ userId: unBlockParam.userId });
    for(var i=0;i<userProfile.blockedProfiles.length;i++){
        if(unBlockParam.unBlockId ===  userProfile.blockedProfiles[i].blockedId){
            userProfile.blockedProfiles.splice(i,1);
            await userProfile.save();
            userProfile.contactInfo.contactNumber = userProfile.contactInfo.maskedContactNumber;
            userProfile.contactInfo.email = userProfile.contactInfo.maskedEmail;

            return userProfile;
        }
    }
    
}

async function getMatches(matchParams) {
    const userProfile = await UserProfile.findOne({ userId: matchParams.userId });
    const preferenceParams = await UserPreferences.findOne({ userId: matchParams.userId });
    
        const allMatches = await UserProfile.find({
            userId: {$ne: userProfile.userId},
            userId: {$nin: userProfile.blockedProfiles},
            "basicInfo.gender": {$eq: preferenceParams.basicInfo.lookingFor}
        });

        return allMatches;
}

async function saveMatches(saveParams){
    const userProfile = await UserProfile.findOne({ userId: saveParams.userId });
    
    userProfile.savedProfiles.push(saveParams.saveUserId);
    userProfile.save();
    return userProfile;
    
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



