const config = require('../config.json');
const db = require('../helpers/db');
const Counter = db.Counter;

module.exports = {
    updateCounter,
    createCounter
};

async function createCounter(counterParam) {
    //validate
    if (await Counter.findOne({ counterId: counterParam.counterId })) {
        throw 'counter "' + counterParam.id + '" is already taken';
    }

    const counter = new Counter(counterParam);

    counter.counterId = counterParam.counterId;
    counter.sequence_value = 100000;

    // save counter
    await counter.save();
}

async function updateCounter(sequenceName) {

    if (!await Counter.findOne({ counterId: sequenceName })) {
        throw 'counter "' + counterId + '" does not exist';
    }
    const counter =  await Counter.findOneAndUpdate(
        {counterId: sequenceName},
        {$inc:{sequence_value:1}},
        {retrunOriginal:false}
    );
    return counter.sequence_value;
}

async function getAll() {
    return await Counter.find();
}

async function getById(id) {
    return await Counter.findById(id);
}

async function _delete(id) {
    await Counter.findByIdAndRemove(id);
}