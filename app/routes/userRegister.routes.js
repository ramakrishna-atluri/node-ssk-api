module.exports = app => {
    const UserRegister = require("../controllers/userRegister.controller.js");
  
    var router = require("express").Router();
  
    // Create a new user
    router.post("/", UserRegister.create);
  
    // Retrieve all User
    router.get("/", UserRegister.findAll);
  
    // Retrieve all published User
    router.get("/published", UserRegister.findAllPublished);
  
    // Retrieve a single user with id
    router.get("/:id", UserRegister.findOne);
  
    // Update a User with id
    router.put("/:id", UserRegister.update);
  
    // Delete a User with id
    router.delete("/:id", UserRegister.delete);
  
    // deleteAll
    router.delete("/", UserRegister.deleteAll);
  
    app.use('/api/UserRegister', router);
  };