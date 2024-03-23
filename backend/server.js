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

const storeUserName = async (id, name) => {
    try {
        const user = await User.create({socketId: id, name: name});
        console.log(`storeUserName is gonna execute`);
        console.log(user);
    } catch (err) {
        console.log(err.message);
    }
} // end of storeUserName

const findUserByName = async (socketId) => {
    try {
        let user = await User.findOne({socketId: socketId});
        if (user) {
            console.log(`I at line 45 am gonna execute`);
            console.log(user.name);
            return user;
        } else {
            console.log(`User with socketId ${socketId} not found.`);
            return null;
        }
    } catch (err) {
        console.log(err.message);
    }    
} // end of findUserById

const removeUser = async (socketId) => {
    try {
        let user = await User.findOneAndDelete({ socketId: socketId });
        if (user) {
            console.log(`User with socketId ${socketId} has been deleted.`);
        } else {
            console.log(`User with socketId ${socketId} not found.`);
        }
    }
    catch (err) {
        console.log(err.message);
    }
} // end of removeUser


// Socket connections and management
const io = require("socket.io")(3000, {
    cors: { 
        origin: "http://localhost:3001",
        methods: ["GET", "POST"]
    }
});

const onlineUsers = new Set()
const connectedUsers = new Map()
let roomNo = 0;

io.on("connection", socket => {
    
    console.log(`A user with socket id ${socket.id} is connected`);
    
    onlineUsers.add(socket.id);
    io.emit("onlineUsers", onlineUsers.size);

    socket.on('user-connected', async (message, nickname, time, joined) => {
        // storeUserName(socket.id, name);
        const user = await User.find({name: nickname, isJoined: true})

        console.log(user)
        
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
        console.log(`A user with socket id ${socket.id} is disconnected`);
        onlineUsers.delete(socket.id);
        io.emit("onlineUsers", onlineUsers.size);
      
        const userLeft = connectedUsers.get(socket.id);
        await User.updateMany({name: userLeft}, {isJoined: false})
        try {
            if (userLeft) {
                const userObj = {
                    name: userLeft,
                    time: new Date().toLocaleTimeString(),
                    message: "left the chat",
                    joined: true
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
        // console.log(`Message to be sent to ${id} is: ${message}`);
        // socket.to(id).emit("receive-message-by-user", message);
        socket.to(userId.socketId).emit("receive-message-by-user", message, sender, `${new Date().getHours()}:${new Date().getMinutes()}`, false);
    })
    
    // socket.on("send-specific-message", async (message, sender, time, receiver) => {
             
    //     // console.log(receiver)
    //     let userId = await User.findOne({name: receiver}, {socketId: 1, _id: 0})
    //     // console.log(userId)
    //     // userId = userId[userId.length - 1].socketId

    //     // console.log(userId)
    //     // createUser(userObj)
    //     // socket.to('iohgjM3gimrqCG8LAAAF').emit("receive-specific-message", message, sender, time, receiver);
    //     socket.to(userId).emit("receive-specific-message", message, sender, time, receiver);
    // })

    
    
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


// app.get("/users/:name", async (req, res) => {  
//     try {
//         const name = req.params.name;
//         let users = await User.findOne({name, specific: true}, {name: 1, message: 1, time: 1, joined: 1, _id: 0})
//         res.json(users);
//     } catch (err) {
//         console.error("Error fetching users:", err);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });