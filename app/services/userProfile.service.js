const db = require('../helpers/db');
const notifcationService = require('./notifications.service');
const { getResponseJson } = require('../helpers/common');
const uploadImage = require('../helpers/upload-images');
const UserPreferences = db.UserPreferences;
const UserProfile = db.UserProfile;
const User = db.User;
const Connections = db.Connections;

module.exports = {
    createProfile,
    updateProfile,
    blockProfile,
    unBlockProfile,
    saveProfile,
    viewProfile,
    connectProfile,
    cancelRequest,
    removeProfile,
    acceptRequest,
    rejectRequest,
    getTopMatches,
    getTopSavedMatches,
    getAllMatches,
    getAllSavedMatches,
    uploadPhoto
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

async function updateProfile(profileParam) {
    const userProfile = await UserProfile.findOne({ userId: profileParam.userId });

    // validate
    if (!userProfile) throw 'User not found';
    
    profileParam.contactInfo.contactNumber = userProfile.contactInfo.contactNumber;
    profileParam.contactInfo.email = userProfile.contactInfo.email;

    let today = new Date();
    let birthDate = new Date(profileParam.kundaliDetails.dob);
    let age = today.getFullYear() - birthDate.getFullYear();

    profileParam.basicInfo.age = age;

    // copy profileParam properties to user profile
    Object.assign(userProfile, profileParam);
    await userProfile.save();

    userProfile.contactInfo.contactNumber = userProfile.contactInfo.maskedContactNumber;
    userProfile.contactInfo.email = userProfile.contactInfo.maskedEmail;

    return userProfile;
}

async function blockProfile(blockParam) {
    const blockedProfile = await UserProfile.findOne({ userId: blockParam.blockId });
    const userConnections = await Connections.findOne({ userId: blockParam.userId });
    // validate
    if (!blockedProfile) return 'Profile not found';

    if(!userConnections && !userConnections.blocked){
        let blockedProfileParams = {};
            blockedProfileParams.userId = blockParam.userId;
            blockedProfileParams.blocked = [{
                userId: blockParam.blockId,
                blockedAt: new Date(Date.now())
            }]

            const blockedProfileRecord = new Connections(blockedProfileParams);
            await blockedProfileRecord.save();
    }else{

        const blockedId = userConnections.blocked.filter(item => item.userId === blockParam.blockId);

        if(blockedId)
            return 'Profile is already blocked'

        let blockedParams = {
            userId: blockParam.blockId,
            blockedAt: new Date(Date.now())
        }

        userConnections.blocked.push(blockedParams)
        await userConnections.save();
    }

    return "success";
    
    // if(userProfile.blockedProfiles.length > 0){
    //     for(var i=0;i<userProfile.blockedProfiles.length;i++){
    //         if( blockParam.blockId === userProfile.blockedProfiles[i].blockedId){
    //             return 'User already blocked';
    //         }else{
    //             userProfile.blockedProfiles.push({blockedId: blockParam.blockId, firstName: blockedProfile.basicInfo.firstName, lastName: blockedProfile.basicInfo.lastName});
    //             await userProfile.save();

    //             userProfile.contactInfo.contactNumber = userProfile.contactInfo.maskedContactNumber;
    //             userProfile.contactInfo.email = userProfile.contactInfo.maskedEmail;
    //             return userProfile;
    //         }
    //     }
    // }else{
    //     userProfile.blockedProfiles.push({blockedId: blockParam.blockId, firstName: blockedProfile.basicInfo.firstName, lastName: blockedProfile.basicInfo.lastName});
    //     await userProfile.save();
    //     userProfile.contactInfo.contactNumber = userProfile.contactInfo.maskedContactNumber;
    //     userProfile.contactInfo.email = userProfile.contactInfo.maskedEmail;
    //     return userProfile;
    // }
    
}

async function unBlockProfile(unBlockParam) {
    let userConnections = await Connections.findOne({ userId: unBlockParam.userId });

    if(userConnections && userConnections.blocked)
    {
        userConnections.blocked = userConnections.blocked.filter(item => item.userId !== unBlockParam.unBlockId);

        const updatedUserConnections = new Connections();
        Object.assign(updatedUserConnections, userConnections);

        await updatedUserConnections.save();

        return 'success';
    }

    return 'failure';
    // const userProfile = await UserProfile.findOne({ userId: unBlockParam.userId });
    // for(var i=0;i<userProfile.blockedProfiles.length;i++){
    //     if(unBlockParam.unBlockId ===  userProfile.blockedProfiles[i].blockedId){
    //         userProfile.blockedProfiles.splice(i,1);
    //         await userProfile.save();
    //         userProfile.contactInfo.contactNumber = userProfile.contactInfo.maskedContactNumber;
    //         userProfile.contactInfo.email = userProfile.contactInfo.maskedEmail;

    //         return userProfile;
    //     }
    // }    
}

async function connectProfile(connectParam) {
    let userConnections = await Connections.findOne({ userId: connectParam.userId });
    const receivingUserConnections = await Connections.findOne({ userId: connectParam.connectUserId });
    
    if(!userConnections){
        let requestedProfileParams = {};
            requestedProfileParams.userId = connectParam.userId;
            requestedProfileParams.requested = [{
                userId: connectParam.connectUserId,
                requestedAt: new Date(Date.now())
            }]

            const requestedProfileRecord = new Connections(requestedProfileParams);
            await requestedProfileRecord.save();

            userConnections = requestedProfileRecord;
           
    }else{
        if(userConnections.requested.filter(item => item.userId !== connectParam.connectUserId))
        {
            let requestedParams = {
                userId: connectParam.connectUserId,
                requestedAt: new Date(Date.now())
            }
    
            userConnections.requested.push(requestedParams)
            await userConnections.save();
        }        
    }

    if(!receivingUserConnections){
        let receivedProfileParams = {};
            receivedProfileParams.userId = connectParam.connectUserId;
            receivedProfileParams.received = [{
                userId: connectParam.userId,
                receivedAt: new Date(Date.now())
            }]

            const receivedProfileRecord = new Connections(receivedProfileParams);
            await receivedProfileRecord.save();
           
    }else{

        if(receivingUserConnections.received.filter(item => item.userId !== connectParam.userId)) {
            
            let receivedParams = {
                userId: connectParam.userId,
                receivedAt: new Date(Date.now())
            }

            receivingUserConnections.received.push(receivedParams)
            await receivingUserConnections.save();
        }
    }
    
    // if(!userConnections.requested.filter(item => item.userId === connectParam.connectUserId)) {
        await notifcationService.createNotification({sender: connectParam.userId, receiver: connectParam.connectUserId, type: 'connect'});
    //}

    return userConnections;    
}

async function cancelRequest(cancelParam) {
    let userConnections = await Connections.findOne({ userId: cancelParam.userId });
    let receivingUserConnections = await Connections.findOne({ userId: cancelParam.cancelUserId });

    if(userConnections)
    {
        userConnections.requested = userConnections.requested.filter(item => item.userId !== cancelParam.cancelUserId);

        const updatedUserConnections = new Connections();
        Object.assign(updatedUserConnections, userConnections);

        await updatedUserConnections.save();

        await notifcationService.deleteNotification({sender: cancelParam.userId, receiver: cancelParam.cancelUserId, type: 'connect'});        
    }

    if(receivingUserConnections) {
        receivingUserConnections.received = receivingUserConnections.received.filter(item => item.userId !== cancelParam.userId);

        await receivingUserConnections.save();
    }

    return userConnections;    
}

async function acceptRequest(acceptParam) {
    let acceptingUserConnections = await Connections.findOne({ userId: acceptParam.userId });
    let requestingUserConnections = await Connections.findOne({ userId: acceptParam.requestUserId });

    if(acceptingUserConnections)
    {
        acceptingUserConnections.received = acceptingUserConnections.received.filter(item => item.userId !== acceptParam.requestUserId);
        acceptingUserConnections.saved = acceptingUserConnections.saved.filter(item => item.userId !== acceptParam.requestUserId);
        acceptingUserConnections.saved = acceptingUserConnections.saved.filter(item => item.userId !== acceptParam.requestUserId);
        
        let connectedParams = {
            userId: acceptParam.requestUserId,
            connectedAt: new Date(Date.now())
        }

        acceptingUserConnections.connected.push(connectedParams);

        const updatedUserConnections = new Connections();
        Object.assign(updatedUserConnections, acceptingUserConnections);

        await updatedUserConnections.save();       
    }

    if(requestingUserConnections) {
        requestingUserConnections.requested = requestingUserConnections.requested.filter(item => item.userId !== acceptParam.userId);

        let connectedParams = {
            userId: acceptParam.userId,
            connectedAt: new Date(Date.now())
        }

        requestingUserConnections.connected.push(connectedParams);

        const updatedRUserConnections = new Connections();
        Object.assign(updatedRUserConnections, requestingUserConnections);

        await updatedRUserConnections.save();
    }

    await notifcationService.createNotification({sender: acceptParam.userId, receiver: acceptParam.requestUserId, type: 'accept'}); 

    return acceptingUserConnections;    
}

async function rejectRequest(rejectParam) {
    let rejectingUserConnections = await Connections.findOne({ userId: rejectParam.userId });
    let requestingUserConnections = await Connections.findOne({userId: rejectParam.requestUserId});

    if(rejectingUserConnections)
    {
        rejectingUserConnections.received = rejectingUserConnections.received.filter(item => item.userId !== rejectParam.requestUserId);
        
        let rejectedParams = {
            userId: rejectParam.requestUserId,
            rejectedAt: new Date(Date.now())
        }

        rejectingUserConnections.rejected.push(rejectedParams);

        const updatedUserConnections = new Connections();
        Object.assign(updatedUserConnections, rejectingUserConnections);

        await updatedUserConnections.save();       
    }

    if(requestingUserConnections){
        requestingUserConnections.requested = requestingUserConnections.requested.filter(item => item.userId !== rejectParam.userId);
        await requestingUserConnections.save();
    }

    return rejectingUserConnections;    
}

async function removeProfile(removeParam) {
    let userConnections = await Connections.findOne({ userId: removeParam.userId });
    let removingUserConnections = await Connections.findOne({ userId: removeParam.removeUserId });

    if(userConnections)
    {
        userConnections.connected = userConnections.connected.filter(item => item.userId !== removeParam.removeUserId);

        await userConnections.save();       
    }

    if(removingUserConnections) {
        removingUserConnections.connected = removingUserConnections.connected.filter(item => item.userId !== removeParam.userId);

        await removingUserConnections.save();
    }

    return userConnections;    
}

async function saveProfile(saveParams) {
    let userConnections = await Connections.findOne({ userId: saveParams.userId });

    if(!userConnections){
        let savedMatchParams = {};
            savedMatchParams.userId = saveParams.userId;
            savedMatchParams.saved = [{
                userId: saveParams.saveUserId,
                savedAt: new Date(Date.now())
            }]

            const savedProfileRecord = new Connections(savedMatchParams);
            await savedProfileRecord.save();

            userConnections = savedProfileRecord;
    }else{
        if(userConnections.saved.filter(item => item.userId !== saveParams.saveUserId))
        {
            let savedParams = {
                userId: saveParams.saveUserId,
                savedAt: new Date(Date.now())
            }
    
            userConnections.saved.push(savedParams)
            await userConnections.save();
        }        
    }
    return userConnections;
}

async function viewProfile(viewParams) {
    let profileToView = await UserProfile.findOne({userId: viewParams.viewProfileId});
    let userConnections = await Connections.findOne({ userId: viewParams.userId });

    if(profileToView) {
        if(!userConnections) {
            
            let viewedProfileParams = {};
                viewedProfileParams.userId = viewParams.userId;
                viewedProfileParams.viewed = [{
                    userId: viewParams.viewProfileId,
                    viewedAt: new Date(Date.now())
                }]
                const viewedProfileRecord = new Connections(viewedProfileParams);
                await viewedProfileRecord.save();

                userConnections = viewedProfileRecord;

        }else{
            if(userConnections.viewed.filter(item => item.userId !== viewParams.viewProfileId)) {
                let viewedProfileParams = {
                    userId: viewParams.viewProfileId,
                    viewedAt: new Date(Date.now())
                }

                userConnections.viewed.push(viewedProfileParams)
                await userConnections.save();
            }
        }
        if(userConnections.viewed.filter(item => item.userId !== viewParams.viewProfileId)) {
            await notifcationService.createNotification({sender: viewParams.userId, receiver: viewParams.viewProfileId, type: 'view'});
        }
    }
    else {
        return 'Profile not found';
    }

    profileToView.contactInfo.contactNumber = profileToView.contactInfo.maskedContactNumber;
    profileToView.contactInfo.email = profileToView.contactInfo.maskedEmail;

    const body = {
        profileData : profileToView,
        connectionsData : userConnections
    }

    return body;
}

async function getTopMatches({userId}) {
    const userProfile = await UserProfile.findOne({ userId: userId });
    const preferenceParams = await UserPreferences.findOne({ userId: userId });
    const connectionsParams = await Connections.findOne({ userId: userId });
    
        const allMatches = await UserProfile.find({
            $and : [
                {userId: {$ne: userProfile.userId}},
                {userId: {$nin: connectionsParams && connectionsParams.blocked ? connectionsParams.blocked.map(function(item){return item.userId;}) : []}},
                {userId: {$nin: connectionsParams && connectionsParams.saved  ? connectionsParams.saved.map(function(item){return item.userId;}) : []}},
                {userId: {$nin: connectionsParams && connectionsParams.connected  ? connectionsParams.connected.map(function(item){return item.userId;}) : []}},
                {
                    $or: [
                        {"locationInfo.country.id": {$in: preferenceParams.locationInfo.country}},
                        {"locationInfo.state.id": {$in: preferenceParams.locationInfo.state}},
                        {"locationInfo.city.id": {$in: preferenceParams.locationInfo.city}}
                    ]
                },                
                {"basicInfo.gender": {$eq: preferenceParams.basicInfo.lookingFor}},
                {"basicInfo.age": { $gt :  preferenceParams.basicInfo.minAge, $lt : preferenceParams.basicInfo.maxAge}},
                ]
           
            }).skip(0).limit(10).select(['userId',
                'basicInfo.firstName',
                'basicInfo.lastName',
                'basicInfo.age',
                'basicInfo.height',
                'locationInfo',
                'educationAndCareerInfo']);
        return allMatches;
}

async function getTopSavedMatches({userId}){
    const connections = await Connections.findOne({userId : userId});
    let data = {};

    if(connections && connections.saved){
        data = await UserProfile.find({
            userId: {$in: connections.saved  ? connections.saved.map(function(item){return item.userId;}) : []}
            }).skip(0).limit(10).select(['userId',
                'basicInfo.firstName',
                'basicInfo.lastName',
                'basicInfo.age',
                'basicInfo.height',
                'locationInfo',
                'educationAndCareerInfo']);
    }

    return data;
}

async function getAllMatches({userId, page}){
    const userProfile = await UserProfile.findOne({ userId: userId });
    const preferenceParams = await UserPreferences.findOne({ userId: userId });
    const connectionsParams = await Connections.findOne({ userId: userId });
    
        const allMatches = await UserProfile.find({
            $and : [
                {userId: {$ne: userProfile.userId}},
                {userId: {$nin: connectionsParams && connectionsParams.blocked ? connectionsParams.blocked.map(function(item){return item.userId;}) : []}},
                {userId: {$nin: connectionsParams && connectionsParams.connected  ? connectionsParams.connected.map(function(item){return item.userId;}) : []}},
                {
                    $or: [
                        {"locationInfo.country.id": {$in: preferenceParams.locationInfo.country}},
                        {"locationInfo.state.id": {$in: preferenceParams.locationInfo.state}},
                        {"locationInfo.city.id": {$in: preferenceParams.locationInfo.city}},
                        // {"familyInfo.familyType" : {$eq: preferenceParams.familyDetails.familyType}},
                        // {"familyInfo.familyValues" : {$eq: preferenceParams.familyDetails.familyValues}},
                        // {"kundaliDetails.nakshatra" : {$eq: preferenceParams.kundaliDetails.nakshatra}},
                        // {"kundaliDetails.zodiacSign": {$eq: preferenceParams.kundaliDetails.zodiacSign}},
                        // {"lifeStyleInfo.eatingHabits": {$eq: preferenceParams.lifeStyleInfo.eatingHabits}},
                    ]
                },                
                {"basicInfo.gender": {$eq: preferenceParams.basicInfo.lookingFor}},
                {"basicInfo.age": { $gt :  preferenceParams.basicInfo.minAge, $lt : preferenceParams.basicInfo.maxAge}},
                // {"basicInfo.maritalStatus" : { $cond: { if: { $eq: [ "$preferenceParams.basicInfo.maritalStatus", "Doesn't Matter" ] }, then: '', else: preferenceParams.basicInfo.maritalStatus } }}
            ]
           
            }).select(['userId',
                'basicInfo.firstName',
                'basicInfo.lastName',
                'basicInfo.age',
                'basicInfo.height',
                'locationInfo',
                'educationAndCareerInfo']);


        return getResponseJson(allMatches, page);
    
}

async function getAllSavedMatches({userId, page}){
    const connections = await Connections.findOne({userId : userId});
    let data = {};

    if(connections && connections.saved){
        data = await UserProfile.find({
            userId: {$in: connections.saved  ? connections.saved.map(function(item){return item.userId;}) : []}
            }).select(['userId',
                'basicInfo.firstName',
                'basicInfo.lastName',
                'basicInfo.age',
                'basicInfo.height',
                'locationInfo',
                'educationAndCareerInfo']);        
    }

    return getResponseJson(data, page);
    
}

async function uploadPhoto(formData,config){
    console.log(formData)
    let response = await uploadImage(formData);
    console.log(response);
    
}