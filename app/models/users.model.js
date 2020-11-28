const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    email: { type: String, unique: true, required: true },
    maskedEmail: { type: String, unique: true, required: true },
    hash: { type: String, required: true },
    userId: { type: String, required: false },
    isActive: { type: Boolean, required: false, default: true },
    createdBy: { type: String, required: false},//usreId, for mediator flow
    isTemporaryPassword: { type: Boolean, required: false, default: false},//temp password, for mediator flow
    roleId: { type: Number, required: false },//customer role, default:1
    verificationToken: { type: String, required: false },
    resetToken: {
        token: String,
        expires: Date
    },
    isVerified: { type: Boolean, required: false, default: false },
    isProfileComplete: { type: Boolean, required: false, default: false },
    profileCompletePercentage: {type: Number, required: false, default: 0},
    expiresIn: {type: Date, required: false}
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

module.exports = mongoose.model('User', schema);