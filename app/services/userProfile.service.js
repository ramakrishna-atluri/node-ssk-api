const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../helpers/db');
const counterService = require('./counter.service');
const { UserPreferences } = require('../helpers/db');
const UserProfile = db.UserProfile;
const User = db.User;
const SavedProfiles = db.SavedProfiles;
const notifcationService = require('./notifications.service');

module.exports = {
    getAll,
    getProfileById,
    createProfile,
    updateProfile,
    blockProfile,
    unBlockProfile,
    getProfile,
    getTopTenProfiles,
    saveMatches,
    getTopTenSavedProfiles,
    delete: _delete
};

async function createProfile(profileParam) {
    //validate
    const user = await User.findOne({ userId: profileParam.userId });

    if (!user) {
        return 'Cannot find user';
    }

    let today = new Date();
    let birthDate = new Date(profileParam.kundaliDetails.dob);
    let age = today.getFullYear() - birthDate.getFullYear();

    profileParam.basicInfo.age = age;
        
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

async function getTopTenProfiles(userId) {
    const userProfile = await UserProfile.findOne({ userId: userId });
    const preferenceParams = await UserPreferences.findOne({ userId: userId });
    const savedProfileParams = await SavedProfiles.findOne({ userId: userId });
    
        const allMatches = await UserProfile.find({
            userId: {$ne: userProfile.userId},
            userId: {$nin: userProfile.blockedProfiles},
            userId: {$nin: savedProfileParams.profiles.map(function(item){return item.userId;})},
            "locationInfo.country.id": {$in: preferenceParams.locationInfo.country},
            "basicInfo.gender": {$eq: preferenceParams.basicInfo.lookingFor}
        }).select(['userId',
                'basicInfo.firstName',
                'basicInfo.lastName',
                'basicInfo.age',
                'basicInfo.height',
                'locationInfo',
                'educationAndCareerInfo.workingAs']);
        return allMatches;
}

async function saveMatches(saveParams){

    const user = await SavedProfiles.findOne({ userId: saveParams.userId });
    
    if(!user){
        let savedMatchParams = {};
            savedMatchParams.userId = saveParams.userId;
            savedMatchParams.profiles = [{
                userId: saveParams.saveUserId,
                savedAt: new Date(Date.now())
            }]
            const savedProfileRecord = new SavedProfiles(savedMatchParams);
            await savedProfileRecord.save();
    }else{
        let savedParams = {
            saveUserId: saveParams.saveUserId,
            savedAt: new Date(Date.now())
        }
        user.profiles.push(savedParams)
        await user.save();
    }
    return "success";
}

async function getTopTenSavedProfiles(userId){
    const savedProfiles = await SavedProfiles.findOne({userId : userId});

    if(savedProfiles){
        const data = await UserProfile.find({
            userId: {$in: savedProfiles.profiles.map(function(item){return item.userId;})}
            }).select(['userId',
                'basicInfo.firstName',
                'basicInfo.lastName',
                'basicInfo.age',
                'basicInfo.height',
                'locationInfo',
                'educationAndCareerInfo.workingAs']);

        return data;
    }
}
async function getAll() {
    return await User.find();
}

async function getProfileById({userId,viewProfileId}) {
    const profile =  await UserProfile.findOne({userId: viewProfileId});

    if(!profile){
        return 'user not found';
    }else{
        await notifcationService.createNotification({sender: userId, receiver: viewProfileId, type: 'view'});
        return profile;
    }
}

async function _delete(id) {
    await User.findByIdAndRemove(id);
}



