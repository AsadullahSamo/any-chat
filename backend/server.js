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

    socket.on("message", message => { // listen for message received from client with same custom event name using socket.emit
        console.log(message)
        io.emit("message", message);
    });

    socket.on("disconnect", () => {
        console.log(`A user with socket id ${socket.id} is disconnected`);
        onlineUsers.delete(socket.id);
        io.emit("onlineUsers", onlineUsers.size);
    })
})





console.log("hello")