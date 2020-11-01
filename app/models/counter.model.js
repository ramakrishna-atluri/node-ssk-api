const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    counterId: { type: String, unique: true, required: true },
    sequence_value: { type: Number, required: true },
},
{ timestamps: true }
);

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
        delete ret.hash;
    }
});

module.exports = mongoose.model('Counters', schema);