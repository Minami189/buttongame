const express = require("express");
const http = require("http");
const {Server} = require("socket.io");

const app = express();
const server = http.createServer(app);
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const {nanoid} = require("nanoid");
//jwt initialization
dotenv.config();
const jwt_secret_key = process.env.JWT_KEY


let timer = 2;
const items = ["🎈","🎄","🧤","🧶","🎩","🏈","👟","🍕","🍔","🍟","🚑","👓","🎃","🎀"];
let pause = false;
let activeItems = []

//keeping track of players and their lists
let players = [];

//keeping track of rooms and their hosts
let rooms = [];

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
    console.log(`${socket.id} has connected`)

    socket.on("button_press", (data)=>{
        //*change later to socket.to.emit for rooms
        socket.broadcast.emit("notify_press" ,{message: `${data.UID} pressed the button!`})
        if(timer <= 0){
            interval.refresh();
            timer = 2; 
            io.emit("timer_tick", {time: timer});
            pause = false
        }
    })

    socket.on("create_room", (data) => {
        //leave all rooms first before autojoining
        socket.rooms.forEach((v)=>{
            if(v != socket.id){
                socket.leave(v);
                console.log("leaving room " + v);
            }
        })
        console.log(`creating room ${data.roomID} with host ${data.host}`)
        rooms = rooms.concat({roomID:data.roomID, host: data.host})
        socket.join(data.roomID);
    });

// join_room: check from your list
    socket.on("join_room", (data) => {
        const roomID = data.roomID;
        
        if (io.sockets.adapter.rooms.has(roomID)) {
            socket.join(roomID);
            socket.emit("attempt_join", { success: true, roomID });
            console.log("joined room " + roomID);
        } else {
            socket.emit("attempt_join", { success: false });
        }
    });

    //for messages in the lobby
    socket.on("send_message", (data)=>{
        socket.join(data.roomID);
        io.to(data.roomID).emit("update_messages", {content: data.content, senderName: data.name});
        console.log(`someone messaged at ${data.roomID} with contents ${data.content}`)
    })

    //emitted from start game button in lobby by host
    socket.on("start_game", (data)=>{
        const roomID = data.roomID;
        const instanceID = data.instanceID;
        //join first
        socket.join(roomID);

        //start game of all joint in the roomID 

        const currentRoom = rooms.find((room)=> room.roomID == roomID);
        console.log(currentRoom);
        rooms.forEach((v)=>{
            console.log("single room: " + v.host);
        })

        if(currentRoom.host == instanceID){
            io.to(data.roomID).emit("begin_game");
        }else{
            console.log(data.instanceID + "you are not the host");
        }        
    }) 

    //on user creating instnace
    socket.on("login",(data)=>{
        const displayName = data.instanceDisplayName;
        const instanceID = nanoid(20);
        const instanceToken = jwt.sign({displayName: displayName, instanceID: instanceID}, jwt_secret_key);

        socket.emit("generate_token", {instanceToken: instanceToken});
    })
    

    //creating random list for each player  
    socket.on("generate_list", (data)=>{

        //for server side
        //this is the random ID generated for the user instance
        const instanceID = data.instanceID;
        let generatedList = []

        for(let i = 0; i < 5; i++){
            const rand = Math.round(Math.random()*13);
            generatedList = generatedList.concat({item: items[rand], taken: false});
        }

        players = players.concat({instanceID: instanceID, list: generatedList});

        console.log(generatedList);
        console.log(players);
        //for clientside rendering of this
        socket.emit("render_list", {generatedList: generatedList});
    })

    //*MUST BE CHANGED LATER WITH NEW SYSTEM
    socket.on("click_item", (data)=>{
        const claimedIndex = data.clickedindex;

        //UID of player who clicked
        const playerUID = data.myUID;
        const clickedItem = data.clickedItem;
        let list = data.list
        

        
        console.log(activeItems);
        
        if (claimedIndex >= 0 && claimedIndex < activeItems.length) {
            //reset everytime to -1 cuz we are checking 
            let foundIndex = -1;

            //look for the first matching item and put its index
            for(let i = 0; i < list.length; i++){
                //if the item's slots in the list are all taken then cant take
                if(list[i].item == clickedItem && list[i].taken == false){
                    foundIndex = i;
                    break;
                }
            }


            //this will technically make the item taken true for everyone
            //but in the client we will check for the player UID of who clicked
            if(foundIndex >= 0){
                list[foundIndex].taken = true;
                activeItems.splice(claimedIndex, 1);
                io.emit("item_claimed", { claim_index: claimedIndex, playerUID:  playerUID, clickedItem: clickedItem, list: list});
            }
            

            const takenItems = list.filter((v)=> v.taken)
            if(takenItems.length >= 5){
                io.emit("game_end", {winnerUID: playerUID});
            }   
            
        }

        console.log("claimed index: " + claimedIndex);
        console.log("active items: " + activeItems);
    })
})








io.listen(3000);