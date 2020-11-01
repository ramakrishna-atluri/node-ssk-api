const db = require("../models");
const userRegister = db.userRegister;

// Create and Save a new User
exports.create = (req, res) => {

    if (!req.body.email) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
      }
    
      // Create a newUser
      const newUser = new userRegister({
        email: req.body.email,
        password: req.body.password,
      });
    
      // Save new User in the database
      newUser
        .save()
        .then(data => {
          res.send(data);
        })
        .catch(err => {
          res.status(500).send({
            message:
              err.message || "Some error occurred while creating the new User."
          });
        });
  
};

// Retrieve all Users from the database.
exports.findAll = (req, res) => {
  
};

// Find a single User with an id
exports.findOne = (req, res) => {
  
};

// Update a User by the id in the request
exports.update = (req, res) => {
  
};

// Delete a User with the specified id in the request
exports.delete = (req, res) => {
  
};

// Delete all Users from the database.
exports.deleteAll = (req, res) => {
  
};

// Find all published Users
exports.findAllPublished = (req, res) => {
  
};