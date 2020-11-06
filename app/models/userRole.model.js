const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    roleName: { type: String, unique: true, required: true },
    roleId: { type: Number, required: true, unique: true },
    
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

module.exports = mongoose.model('userRole', schema);