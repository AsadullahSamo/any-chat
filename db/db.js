const dotenv = require("dotenv")
dotenv.config({ path: "./config.env" });
const express = require("express");
const cors = require("cors");

const User = require("./Models/userModel");

const userController = require("./Controllers/userController")
const mongoose = require("mongoose");
const app = express();
app.use(express.json());       // To parse the request body and get the request body     This line is necessary even though method definition is in another file
app.use(cors());

mongoose.connect(`${process.env.CON_STR}`)
.then((con) => { 
    console.log("Connected to MongoDB")
    // console.log(con.connections)
}).catch(err => console.log("Error connecting to MongoDB", err.message));

const createUser = async (userObj) => {
    try {
        const user = await User.create(userObj);
        console.log(user);
    } catch (err) {
        console.log(err.message);
    }
}

createUser({name: "Asad", time: "12:00", message: "Hello World"})
   
app.get("/users", async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});


const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})

