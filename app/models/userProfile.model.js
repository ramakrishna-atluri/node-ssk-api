const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  userId :{type: String, required: false},
  basicInfo:{
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    maritalStatus: { type: String, required: false },
    gender: { type: String, required: false },
    height: { type: String, required: false },
    bloodGroup: { type: String, required: false },
    bodyWeight: { type: String, required: false },
    disability: { type: String, required: false }
  },
  kundaliDetails:{
    dob: { type: String, required: false },
    birthTime: { type: String, required: false },
    birthPlace: { type: String, required: false },
    gothra: { type: String, required: false },
    zodiacSign: { type: String, required: false },
    nakshatra: { type: String, required: false },
    charan: { type: String, required: false },
    gan: { type: String, required: false },
    naadi: { type: String, required: false },
  },
  familyInfo:{
    fatherName: { type: String, required: false },
    motherName: { type: String, required: false },
    fatherStatus: { type: String, required: false },
    motherStatus: { type: String, required: false },
    nativePlace: { type: String, required: false },
    numberOfSiblings: { type: String, required: false },
    familyType: { type: String, required: false },
    familyValues: { type: String, required: false },
  },
  educationAndCareerInfo:{
    highestQualification: { type: String, required: false },
    collegeAttended: { type: String, required: false },
    workingWith: { type: String, required: false },
    workingAs: { type: String, required: false },
    employerName: { type: String, required: false },
    annualIncome: { type: String, required: false },
  },
  lifeStyleInfo:{
    eatingHabits: {type: String, required: false},
    smokingHabits: {type: String, required: false},
    drinkingHabits: {type: String, required: false}
  },
  locationInfo:{
    country: {type: String, required: false},
    state: {type: String, required: false},
    city: {type: String, required: false}
  },
  contactInfo:{
    contactNumber: {type: String, required: false},
    maskedContactNumber: {type: String, required: false},
    phoneVerified: {type: Boolean, required: false, default: false},
  },
  blockedProfiles:{ type: Array, required: false},
  savedProfiles:{ type: Array, required: false}
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

module.exports = mongoose.model('userProfile', schema);