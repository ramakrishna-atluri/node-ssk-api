module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        basicinfo:{
            firstName: String,
            lastName: String,
            dob: String,
            maritalStatus: String,
            gender: String,
            height: String,
            bloodGroup: String,
            bodyWeight: String,
            disability: Boolean,
        }
        
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const userProfile = mongoose.model("userProfile", schema);
    return userProfile;
  };