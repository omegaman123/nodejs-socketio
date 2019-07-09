'use strict';

const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const fs = require('fs');
const app = express();
const server = http.Server(app);
const io = socketIO(server);

const FIELD_WIDTH = 1000, FIELD_HEIGHT = 1000;
class Player{
    constructor(obj={}){
        this.id = Math.floor(Math.random()*1000000000);
        this.width = 80;
        this.height = 80;
        this.x = Math.random() * (FIELD_WIDTH - this.width);
        this.y = Math.random() * (FIELD_HEIGHT - this.height);
        this.movement = {};
    }
    move(dX,dY){
        this.x += dX;
        this.y += dY;
    }
};

fs.readFile(path.resolve(__dirname,"static/test-clients/test-client-1.json"),(err,data)=>{
if (err) throw err;
    let st = JSON.parse(data);
    console.log(st);
});


let players = {};

io.on('connection', function(socket) {
    let player = null;
    console.log("connection success")
    socket.on('game-start', (config) => {
        player = new Player({
            socketId: socket.id,
        });
        players[player.id] = player;
    });
    socket.on('movement', function(movement) {
        if(!player){return;}
        player.movement = movement;
    });
    socket.on('disconnect', () => {
        if(!player){return;}
        delete players[player.id];
        player = null;
    });
});

setInterval(function() {
    Object.values(players).forEach((player) => {
        const movement = player.movement;
        if(movement.forward){
            player.move(0,-5);
        }
        if(movement.back){
            player.move(0,5);
        }
        if(movement.left){
            player.move(-5,0)
        }
        if(movement.right){
            player.move(5,0);
        }
    });
    io.sockets.emit('state', players);
}, 1000/30);

app.use('/static', express.static(__dirname + '/static'));

app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, '/static/index.html'));
});

server.listen(3000, function() {
    console.log('Starting server on port 3000');
});