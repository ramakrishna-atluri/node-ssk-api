const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../helpers/db');
const UserPreferences = db.UserPreferences;

module.exports = {
    authenticate,
    getAll,
    getById,
    createPreference,
    getPreferences,
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

async function createPreference(preferenceParam) {
    const userPreference = new UserPreferences(preferenceParam);
    // save preference
    await userPreference.save();
}

async function getPreferences(preferenceParam) {
    //validate
    return await UserPreferences.find({ email: preferenceParam.userId });
}

async function update(id, preferenceParam) {
    const user = await User.findById(id);

    // validate
    if (!user) throw 'User not found';
    if (user.email !== preferenceParam.email && await User.findOne({ email: preferenceParam.email })) {
        throw 'email "' + preferenceParam.email + '" is already taken';
    }

    // hash password if it was entered
    if (preferenceParam.password) {
        preferenceParam.hash = bcrypt.hashSync(preferenceParam.password, 10);
    }

    // copy preferenceParam properties to user
    Object.assign(user, preferenceParam);
    await user.save();
}


async function _delete(id) {
    await User.findByIdAndRemove(id);
}



