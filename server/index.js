const express = require("express");
const http = require("http");
const {Server} = require("socket.io");

const app = express();
const server = http.createServer(app);
let timer = 2;
const items = ["🎈","🎄","🧤","🧶","🎩","🏈","👟","🍕","🍔","🍟","🚑","👓","🎃","🎀"];
let pause = false;
let activeItems = []

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT"]
    }
});



//Global timer
const interval = setInterval(()=>{
    if(timer <= 10 && timer >= 1){
        timer--;
        io.emit("timer_tick", {time: timer})
    }

//global item randomization 

    else if(!pause){
        let chosen = [];
        let positionx = [];
        let positiony = [];
        pause = true; 
        for (let i = 0; i < 3; i++){
            chosen.push(Math.round(Math.random() * 13));
            positiony.push(Math.random());
            positionx.push(Math.random());
        }

        //everytime the timer runs out reset the server to think all items are active
        activeItems = chosen;

        console.log(`chosen items ${chosen}`);
        io.emit("populate_items", {chosenItems: chosen, positionx: positionx, positiony: positiony})
    }
    
}, 1000);



//button press mechanic
io.on("connection", (socket)=>{

    socket.on("button_press", (data)=>{
        //change later to socket.to.emit for rooms
        socket.broadcast.emit("notify_press" ,{message: `${data.UID} pressed the button!`})
        if(timer <= 0){
            interval.refresh();
            timer = 2; 
            io.emit("timer_tick", {time: timer});
            pause = false
        }
    })
    
    socket.on("click_item", (data)=>{
        const claimedIndex = data.clickedindex;
        console.log(activeItems);

        if (claimedIndex >= 0 && claimedIndex < activeItems.length) {
            console.log("success");
            activeItems.splice(claimedIndex, 1); 
            io.emit("item_claimed", { claim_index: claimedIndex });
        }

        console.log("claimed index: " + claimedIndex);
        console.log("active items: " + activeItems);
    })
})








io.listen(3000);




