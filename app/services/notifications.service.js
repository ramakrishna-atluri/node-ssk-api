const config = require('../config.json');
const db = require('../helpers/db');
const UserProfile = db.UserProfile;
const Notifications = db.Notifications;

module.exports = {
    createNotification,
    updateNotification,
    deleteNotification,
    getNotifications,
    deleteAllNotifications,
    getNotificationCount
};

async function createNotification({sender, receiver, type, content})
{
    const senderUser = await UserProfile.findOne({userId: sender});
    const existingNotification = await Notifications.findOne({sender: sender, receiver: receiver, type: type});

    if(!existingNotification) {        
        const notification = new Notifications();
        notification.sender = sender;
        notification.receiver = receiver;
        notification.type = type;

        notification.content = getNotificationContent(senderUser, type, content);

        await notification.save();        
    }   

    if(existingNotification && existingNotification.isRead) {
        existingNotification.isRead = false;

        existingNotification.save();
    }

    return 'success';
}

async function updateNotification({sender, receiver, type, content})
{
    const notification = await Notifications.findOne({sender : sender, receiver : receiver, type : type});        

    const updatedNotication = notification;
    updatedNotication.isRead = true;

    Object.assign(notification, updatedNotication);

    await notification.save();

    return 'success';
}

async function deleteNotification({sender, receiver, type})
{
    await Notifications.deleteOne({sender : sender, receiver : receiver, type : type}); 

    return 'success';
}

async function deleteAllNotifications({userId})
{
    await Notifications.deleteMany({receiver : userId}); 

    return 'success';
}

async function getNotifications({userId})
{
    const notifications = await Notifications.find({receiver: userId}).sort([['updatedAt', 'descending']]).select(['-createdAt', '-updatedAt']);

    await Notifications.updateMany({receiver: userId, type: 'view'}, { $set: { isRead: true, } } , { multi: true });

    return notifications;
}

async function getNotificationCount({userId}){
    const notificationCount = await Notifications.find({receiver : userId, isRead: false}).countDocuments();
    return notificationCount;
}

function getNotificationContent(senderUser, type)
{
    let content = '';

    if(type === 'view'){
        content = senderUser.basicInfo.firstName + ' ' + senderUser.basicInfo.lastName + ' has viewed your profile!';
    }
    else if (type === 'connect')
    {
        content = senderUser.basicInfo.firstName + ' ' + senderUser.basicInfo.lastName + ' wants to connect with you!';
    }
    else if (type === 'accept')
    {
        content = senderUser.basicInfo.firstName + ' ' + senderUser.basicInfo.lastName + ' has accepted your request!';
    }
    else {
        content = content;
    }

    return content;
}