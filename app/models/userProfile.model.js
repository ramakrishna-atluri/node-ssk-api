const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  profileId :{type: String, required: true},
  basicinfo:{
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dob: { type: String, required: true },
    maritalStatus: { type: String, required: true },
    gender: { type: String, required: true },
    height: { type: String, required: true },
    bloodGroup: { type: String, required: false },
    bodyWeight: { type: String, required: false },
    disability: { type: Boolean, required: true }
  },
  familyInfo:{
    fatherName: { type: String, required: true },
    motherName: { type: String, required: true },
    fatherStatus: { type: String, required: true },
    motherStatus: { type: String, required: true },
    nativePlace: { type: String, required: true },
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
    diet: {type: String, required: false}
  },
  locationInfo:{
    country: {type: String, required: false},
    state: {type: String, required: false},
    city: {type: String, required: false}
  },
  contactInfo:{
    email: {type: String, required: true},
    phone: {type: String, required: true}
  }
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