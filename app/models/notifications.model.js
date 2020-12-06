const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    sender: { type: String, required: true },
    receiver: { type: String, required: true },
    type: { type: String, required: true }, //view, connect, system
    content: { type: String, required: true },
    isRead: { type: Boolean, required: false, default: false}
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

module.exports = mongoose.model('notifications', schema);