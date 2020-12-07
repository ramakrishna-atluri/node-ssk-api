const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    userId: { type: String, required: false },
    saved: {type: Array, required: false},
    viewed: {type: Array, required: false},
    blocked: {type: Array, required: false},
    requested: {type: Array, required: false},
    received: {type: Array, required: false},
    accepted: {type: Array, require: false},
    rejected: {type: Array, require: false}
    }
);

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
        delete ret.hash;
    }
});

module.exports = mongoose.model('connections', schema);