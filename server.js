'use strict';

const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const app = express();
const server = http.Server(app);
const io = socketIO(server);
let clients = 0;

const FIELD_WIDTH = 1000, FIELD_HEIGHT = 1000;

//Client object with position and id, stored on server, displayed on client.
class Client {
    constructor(obj = {}) {
        this.id;
        this.socketID;
        this.x = 0;
        this.y = 5;
        this.z = 0;
        this.movement = {};
        //this.URL = "static/test-clients/test-client-" + this.id + ".json";
    }

    move(dX, dY) {
        this.x += dX;
        this.z += dY;
    }
    remove(){
        delete clts[this.id];
    }
};

// Array of clients to be kept on server.
let clts = {};


io.on('connection', function (socket) {
    let client = null;
    console.log("connection success");
    socket.on('new-client', (config) => {
        console.log("clients# " + clients);
        client = new Client();
        client.id = ++clients;
        client.socketID = socket.id;
        clts[client.id] = client;

    });
    // If server receives update, check ID, create new client if new ID, update movement field regardless.
    // Communicate to client that update needs to be rendered.
    socket.on('update',  function(update){
        if (!clts[update.id]) {
            //console.log("blah");
            var cl = new Client();
            cl.id = update.id;
            cl.socketID = socket.id;
            clts[update.id] = cl;
        }
        //console.log(update.id);
        clts[update.id].movement = update;
        //console.log("bloo");
        socket.emit('update-return',clts);
    });


    socket.on('disconnect', () => {
       console.log("disconnect");
       return;
    });
});

// Checks movement field of each client at set interval (30/sec) whether position needs to be updated.
// Communicates that update needs to be rendered in client.
setInterval(function () {
   // sleep(1000);
    Object.values(clts).forEach((client) => {
        //console.log(client.id);
        const mov = client.movement;
        if (mov.up){
            client.move(0,-1);
        }
        if (mov.down){
            client.move(0,1);
        }
        if (mov.left){
            client.move(-1,0);
        }
        if (mov.right){
            client.move(1,0);
        }
    });
    io.sockets.emit('update-return', clts);

}, 1000/30);

app.use('/static', express.static(__dirname + '/static'));

app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, '/static/index.html'));
});

server.listen(3000, function () {
    console.log('Starting server on port 3000');
});