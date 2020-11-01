module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
            email: String,
            password: String
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const userRegister = mongoose.model("Users", schema);
    return userRegister;
  };