const fs = require("fs");      
const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({        // In this schema, we can define the properties we want to have for our model
    name: {
        type: String,
    },
    message: {
        type: String,
        minLength: [1], 
        maxLength: [1000],
    },
    time: {
        type: String,
    },
    
})



const Users = mongoose.model("users", userSchema); // 1st arg is name of model, and 2nd arg is schema we want to use for this model
// Using above model we can perform CRUD operations on our database
// In database a collection will be created with name movies (plural of model name)
// Convention is to start the model name with capital letter



module.exports = Users;