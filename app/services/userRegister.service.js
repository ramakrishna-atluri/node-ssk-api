const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../helpers/db');
const counterService = require('../services/counter.service');
const User = db.User;

module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    update,
    delete: _delete
};

async function authenticate({ email, password }) {
    const user = await User.findOne({ email });
    if (user && bcrypt.compareSync(password, user.hash)) {
        const token = jwt.sign({ sub: user.id }, config.secret, { expiresIn: '7d' });
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

async function create(userParam) {
    // validate
    if (await User.findOne({ email: userParam.email })) {
        throw 'email "' + userParam.email + '" is already taken';
    }

    const user = new User(userParam);

    // hash password
    if (userParam.password) {
        user.hash = bcrypt.hashSync(userParam.password, 10);
    }
    user.status = true;
    var counter = await counterService.updateCounter("userId");
    console.log(counter);
    user.userId = counter; 
    // save user
    await user.save();
}

async function update(id, userParam) {
    const user = await User.findById(id);

    // validate
    if (!user) throw 'User not found';
    if (user.email !== userParam.email && await User.findOne({ email: userParam.email })) {
        throw 'email "' + userParam.email + '" is already taken';
    }

    // hash password if it was entered
    if (userParam.password) {
        userParam.hash = bcrypt.hashSync(userParam.password, 10);
    }

    // copy userParam properties to user
    Object.assign(user, userParam);
    await user.save();
}

async function updateCounter(sequenceName) {

    // db.collection('counters').find().toArray(function(err, docs) {
    //     console.log(JSON.stringify(docs));
    // });
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



