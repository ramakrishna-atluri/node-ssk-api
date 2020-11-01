const dbConfig = require("../config/db.config.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.userRegister = require("./userRegister.model.js")(mongoose);
db.userProfile = require("./userProfile.model.js")(mongoose);

module.exports = db;