const dotenv = require("dotenv")
dotenv.config({ path: "../db/config.env" });
const express = require("express");
const cors = require("cors");
const User = require("./Models/userModel");

// Database operations
const mongoose = require("mongoose");
const app = express();
app.use(express.json());       // To parse the request body and get the request body     This line is necessary even though method definition is in another file
app.use(cors());

mongoose.connect(`${process.env.CON_STR}`, {
    bufferCommands: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
})
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
   
// Socket connections and management


const io = require("socket.io")(3000, {
    cors: { 
        origin: "http://localhost:3001",
        methods: ["GET", "POST"]
    }
});

const onlineUsers = new Set()

io.on("connection", socket => {
    console.log(`A user with socket id ${socket.id} is connected`);
    onlineUsers.add(socket.id);

    io.emit("onlineUsers", onlineUsers.size);

    socket.on("send-message", (message, nickname, time) => { // listen for message received from client with same custom event name using socket.emit
        console.log(message)


        const userObj = {
            name: nickname,
            time: time,
            message: message
        }        
        createUser(userObj)

        socket.broadcast.emit("receive-message", message, nickname, time);
    });

    socket.on("disconnect", () => {
        console.log(`A user with socket id ${socket.id} is disconnected`);
        onlineUsers.delete(socket.id);
        io.emit("onlineUsers", onlineUsers.size);
    })
})

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

