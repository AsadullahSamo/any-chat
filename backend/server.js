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
    const PORT = 8000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
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

const connectedUsers = new Map()

io.on("connection", socket => {
    
    console.log(`A user with socket id ${socket.id} is connected`);
    

    socket.on('user-connected', async (message, nickname, time, joined) => {
        // storeUserName(socket.id, name);
        const user = await User.find({name: nickname, isJoined: true})
        
        let userObj;
        if (user.length === 0 && nickname !== null && nickname !== "" && nickname !== undefined) {        
            userObj = {
                socketId: socket.id,
                name: nickname,
                message: message,
                time: time,
                joined: joined,
                isJoined: true,
                receiver: "all"
            }        
            createUser(userObj)
            // socket.broadcast.emit("user-connected", userObj);
        } else {
            const updateUserId = await User.updateMany({name: nickname}, {$set: {socketId: socket.id}})
            console.log(`User with name ${nickname} already exists.`);
        }
        connectedUsers.set(socket.id, nickname);
    });

    socket.on("send-message", (message, nickname, time) => { // listen for message received from client with same custom event name using socket.emit
        const userObj = {
            name: nickname,
            time: time,
            message: message,
            joined: false,
            receiver: "all"
        }        
        createUser(userObj)
        socket.broadcast.emit("receive-message", message, nickname, time, false);
    });  // end of socket.on send-message

    socket.on("disconnect", async () => {
        console.log(`User with socket id ${socket.id} disconnected`);
        
        const userLeft = connectedUsers.get(socket.id);
        socket.emit("user-disconnect", connectedUsers.get(userLeft));

        await User.updateMany({name: userLeft}, {$set: {isJoined: false}})
        try {
            if (userLeft) {
                const userObj = {
                    name: userLeft,
                    time: new Date().toLocaleTimeString(),
                    message: "left the chat",
                    joined: true,
                    receiver: "all"
                };
                createUser(userObj);
            }
        } catch (error) {
            console.error("Error handling user disconnection:", error);
        }  
    }) // end of socket.on disconnect

    
    socket.on("send-message-to-user", async (message, sender, time, receiver, senderId) => {
        const userObj = {
            name: sender,
            time: time,
            message: message,
            joined: false, 
            specific: true,
            receiver: receiver
        }   
        createUser(userObj)
        let userId = await User.findOne({name: receiver}, {socketId: 1, _id: 0})        
        console.log(userId)
        socket.to(userId.socketId).emit("receive-message-by-user", message, sender, `${new Date().getHours()}:${new Date().getMinutes()}`, false);
    })   
    
})

app.get("/users/:name", async (req, res) => {
    const name = req.params.name;
    try {
        const users = await User.find( {$or: [{receiver: "all"}, {receiver: name}] });
        res.json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/users", async (req, res) => {
    try {
        let users = await User.distinct("name", {isJoined: true});
        res.json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: "Internal server error" });
    }
})
