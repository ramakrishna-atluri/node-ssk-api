const config = require('../config.json');
const mongoose = require('mongoose');
const connectionOptions = { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false };
mongoose.connect(process.env.MONGODB_URI || config.connectionString, connectionOptions);
mongoose.Promise = global.Promise;

module.exports = {
    User: require('../models/users.model'),
    Counter: require('../models/counter.model'),
    UserProfile: require('../models/userProfile.model'),
    UserRole: require('../models/userRole.model'),
    UserPreferences: require('../models/userPreferences.model'),
    RefreshToken: require('../models/refreshToken.model'),
    Connections: require('../models/connections.model'),
    Notifications: require('../models/notifications.model'),
    isValidId
};

function isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}