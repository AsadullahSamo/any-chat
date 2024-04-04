const dotenv = require("dotenv")
dotenv.config({ path: "./config.env" });
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
    } catch (err) {
        console.log(err.message);
    }
}

// Socket connections and management
const io = require("socket.io")(3000, {
    cors: { 
        origin: "http://localhost:8080",
        methods: ["GET", "POST"]
    }
});

const connectedUsers = new Map()

io.on("connection", socket => {    

    socket.on('user-connected', async (nickname) => {
        const user = await User.find({name: nickname})
        let userObj;
        if (user.length === 0) {        
            userObj = {
                socketId: socket.id,
                name: nickname,
            }        
            createUser(userObj)
        } else {
            const updateUserId = await User.updateMany({name: nickname}, {$set: {socketId: socket.id}})
        }
        connectedUsers.set(socket.id, nickname);
        const users = Array.from(connectedUsers.values());
        const distinctUsers = new Set(users);
        io.emit("user-connected", Array.from(distinctUsers))
    });

    socket.on("send-message", (message, nickname, time) => { // listen for message received from client with same custom event name using socket.emit
        const userObj = {
            name: nickname,
            time: time,
            message: message,
            receiver: "all"
        }        
        createUser(userObj)
        socket.broadcast.emit("receive-message", message, nickname, time);
    });  // end of socket.on send-message

    socket.on("disconnect", async () => {        
        const userLeft = connectedUsers.get(socket.id);
        console.log("User disconnected:", userLeft, connectedUsers);
        socket.broadcast.emit("user-disconnect", userLeft);
        connectedUsers.delete(socket.id);
    }) // end of socket.on disconnect

    
    socket.on("send-message-to-user", async (message, sender, time, receiver) => {
        const userObj = {
            name: sender,
            time: time,
            message: message,
            receiver: receiver
        }   
        const senderObj = {
            name: sender,
            time: time,
            message: message,
            receiver: sender,
            to: receiver
        }
        createUser(userObj)
        createUser(senderObj)
        let receiverId = await User.findOne({name: receiver}, {socketId: 1, _id: 0})     
        socket.to(receiverId.socketId).emit("send-message-to-user", message, sender, `${new Date().getHours()}:${new Date().getMinutes()}`);        
    })   
})

// API routes
app.get("/users/all", async (req, res) => {
    try {
        const users = await User.find({receiver: "all"});
        res.json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/users/:name", async (req, res) => {
    const name = req.params.name;
    try {
        const users = await User.find( {$or: [{receiver: name}, {$and: [{receiver: name}, {to: name}]}]} );
        res.json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/users", async (req, res) => {
    try {
        const users = Array.from(connectedUsers.values());
        const distinctUsers = new Set(users);
        console.log("Connected users:", Array.from(distinctUsers));
        res.json(Array.from(distinctUsers));
    } catch(e) {
        console.error("Error fetching online users:", err);
        res.status(500).json({ error: "Internal server error" });
    }
})
