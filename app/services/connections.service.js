const db = require('../helpers/db');
const { getResponseJson } = require('../helpers/common');
const UserProfile = db.UserProfile;
const Connections = db.Connections;

module.exports = {
    connected,
    rejected,
    received,
    requested,
    getConnectedCount,
    getReceivedCount
};


async function connected({userId, page}) {
    const connections = await Connections.findOne({userId : userId});
    let data = {};

    if(connections && connections.connected){
        data = await UserProfile.find({
            userId: {$in: connections.connected  ? connections.connected.map(function(item){return item.userId;}) : []}
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

async function rejected({userId, page}) {
    const connections = await Connections.findOne({userId : userId});
    let data = {};

    if(connections && connections.rejected){
        data = await UserProfile.find({
            userId: {$in: connections.rejected  ? connections.rejected.map(function(item){return item.userId;}) : []}
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

async function received({userId, page}) {
    const connections = await Connections.findOne({userId : userId});
    let data = {};

    if(connections && connections.received){
        data = await UserProfile.find({
            userId: {$in: connections.received  ? connections.received.map(function(item){return item.userId;}) : []}
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

async function requested({userId, page}) {
    const connections = await Connections.findOne({userId : userId});
    let data = {};

    if(connections && connections.requested){
        data = await UserProfile.find({
            userId: {$in: connections.requested  ? connections.requested.map(function(item){return item.userId;}) : []}
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

async function getConnectedCount({userId}) {
    const connections = await Connections.findOne({userId : userId});

    if(connections)
        return connections.connected.length;
    else 
        return 0;
}

async function getReceivedCount({userId}) {
    const connections = await Connections.findOne({userId : userId});

    if(connections)
        return connections.received.length;
    else 
        return 0;
}