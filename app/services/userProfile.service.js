const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../helpers/db');
const usersService = require('./users.service');
const counterService = require('./counter.service');
const UserProfile = db.UserProfile;

module.exports = {
    authenticate,
    getAll,
    getById,
    createProfile,
    getProfile,
    update,
    delete: _delete
};

async function authenticate({ email, password }) {
    const user = await User.findOne({ email });
    if (user && bcrypt.compareSync(password, user.hash)) {
        const token = jwt.sign({ email: user.email, password: user.password }, config.secret, { expiresIn: '1d' });
        return {
            ...user.toJSON(),
            token
        };
    }
}

async function getAll() {
    return await User.find();
}

async function getById(id) {
    return await User.findById(id);
}

async function createProfile(profileParam) {
    //validate

    const profile = new UserProfile(profileParam);
    var counter = await counterService.updateCounter("userProfileId");
    profile.userProfileId = counter;
    
    // save profile
    await profile.save();
}

async function getProfile(profileParam) {
    //validate
    return await UserProfile.find({ email: profileParam.contactInfo.email });
}

async function update(id, profileParam) {
    const user = await User.findById(id);

    // validate
    if (!user) throw 'User not found';
    if (user.email !== profileParam.email && await User.findOne({ email: profileParam.email })) {
        throw 'email "' + profileParam.email + '" is already taken';
    }

    // hash password if it was entered
    if (profileParam.password) {
        profileParam.hash = bcrypt.hashSync(profileParam.password, 10);
    }

    // copy profileParam properties to user
    Object.assign(user, profileParam);
    await user.save();
}

async function updateCounter(sequenceName) {

    const seqValue = db.counters.findAndModify({
        query:{_id: sequenceName},
        update: {$inc:{sequence_value:1}},
        new:true
    });

    return seqValue.sequence_value;
    //return await Counter.find({counterId: sequenceName});
}

async function _delete(id) {
    await User.findByIdAndRemove(id);
}



