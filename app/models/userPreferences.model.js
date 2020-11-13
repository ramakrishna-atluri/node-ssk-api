const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  userId :{type: String, required: false},
  basicInfo:{
    maritalStatus: { type: String, required: false },
    minHeight: { type: String, required: false },
    maxHeight: { type: String, required: false },
    minAge: { type: String, required: false },
    maxAge: { type: String, required: false },
    lookingFor: { type: String, required: false }
  },
  kundaliDetails:{
    zodiacSign: { type: String, required: false },
    nakshatra: { type: String, required: false },
  },
  familyDetails:{
    familyType: { type: String, required: false },
    familyValues: { type: String, required: false },
  },
  educationAndCareerInfo:{
    highestQualification: { type: String, required: false },
    workingWith: { type: String, required: false },
    workingAs: { type: String, required: false },
  },
  lifeStyleInfo:{
    eatingHabits: {type: String, required: false},
    smokingHabits: {type: String, required: false},
    drinkingHabits: {type: String, required: false}
  },
  locationInfo:{
    country: {type: Array, required: false},
    state: {type: Array, required: false},
    city: {type: Array, required: false}
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

module.exports = mongoose.model('userPreference', schema);