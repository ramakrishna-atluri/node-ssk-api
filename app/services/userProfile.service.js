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
    blockProfile,
    unBlockProfile,
    getProfile,
    getMatches,
    delete: _delete
};

async function createProfile(profileParam) {
    //validate

    let contactNumber = profileParam.contactInfo.contactNumber;

    if(contactNumber) {

        let arr = contactNumber.split(" ");
        const countryCode = arr.splice(0,1).join("");
        const phoneNumber = arr.join("").replace(' ', '').replace(/\d(?=\d{4})/g, "*");
        
        const maskedContactNumber = countryCode + phoneNumber;
        profileParam.contactInfo.contactNumber = countryCode + arr.join("");
        profileParam.contactInfo.maskedContactNumber = maskedContactNumber;

    }
    const profile = new UserProfile(profileParam);
    const user = await User.findOne({ userId: profileParam.userId });
    
    // save profile
    user.profileCompletePercentage += 80;
    if(user.profileCompletePercentage === 100){
        user.isProfileComplete = true;
    }
    await user.save();
    await profile.save();
    profile.contactInfo.contactNumber = profile.contactInfo.maskedContactNumber;
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
    // copy profileParam properties to user profile
    Object.assign(userProfile, profileParam);
    await userProfile.save();

    userProfile.contactInfo.contactNumber = userProfile.contactInfo.maskedContactNumber;
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
                return userProfile;
            }
        }
    }else{
        userProfile.blockedProfiles.push({blockedId: blockParam.blockId, firstName: blockedProfile.basicInfo.firstName, lastName: blockedProfile.basicInfo.lastName});
        await userProfile.save();
        userProfile.contactInfo.contactNumber = userProfile.contactInfo.maskedContactNumber;
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
            return userProfile;
        }
    }
    
}

async function getMatches(matchParams) {
    const userProfile = await UserProfile.findOne({ userId: matchParams.userId });
    
        const allMatches = await UserProfile.find({
            userId: {$ne: userProfile.userId},
            userId: {$nin: userProfile.blockedProfiles},
            "basicInfo.gender": {$ne: userProfile.basicInfo.gender }
        });
        return allMatches;
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



