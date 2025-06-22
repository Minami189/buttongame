const express = require("express");
const http = require("http");
const {Server} = require("socket.io");

const app = express();
const server = http.createServer(app);
let timer = 10;

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT"]
    }
});

setInterval(()=>{
    if(timer <= 10 && timer >= 1){
        timer--;
        io.emit("timer_tick", {time: timer})
    }
    
    }, 1000);

io.on("connection", (socket)=>{
    console.log(socket.id);

    socket.on("button_press", (data)=>{
        //change later to socket.to.emit for rooms
        socket.broadcast.emit("notify_press" ,{message: `${data.UID} pressed the button!`})
        if(timer <= 0){
            timer = 10; 
            io.emit("timer_tick", {time: timer});
        }
    })    
})



io.listen(3000);




