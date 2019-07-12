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
        this.update = {};
        //this.URL = "static/test-clients/test-client-" + this.id + ".json";
    }

    move(dX, dY) {
        this.x += dX;
        this.z += dY;
    }
    remove(){
        delete objList[this.id];
    }
};

// Array of objects to be kept on server.
let objList = {};


io.on('connection', function (socket) {
    console.log("connection success");
    // If server receives update, check ID, create new obj if new ID, update update field regardless.
    // Communicate to client that update needs to be rendered.
    socket.on('update',  function(update){
        //Id not recognized, create new object for new ID
        if (!objList[update.id]) {
           //console.log("blah");
            var cl = new Client();
            cl.id = update.id;
            cl.socketID = socket.id;
            objList[update.id] = cl;
        }
        //console.log(update.id);
        objList[update.id].update = update;
        //console.log("bloo");
        socket.emit('update-return',objList);
    });


    socket.on('disconnect', () => {
       console.log("disconnect");
       return;
    });
});

// Checks update field of each client at set interval (30/sec) whether position needs to be updated.
// Communicates that update needs to be rendered in client.
setInterval(function () {
   // sleep(1000);
    Object.values(objList).forEach((client) => {
        //console.log(client.id);
        const mov = client.update;
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
    io.sockets.emit('update-return', objList);

}, 1000/30);

app.use('/static', express.static(__dirname + '/static'));

app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, '/static/index.html'));
});

server.listen(3000, function () {
    console.log('Starting server on port 3000');
});