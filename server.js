'use strict';

const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const fs = require('fs');
const app = express();
const server = http.Server(app);
const io = socketIO(server);
let clients = 0;

const FIELD_WIDTH = 1000, FIELD_HEIGHT = 1000;


class Client {
    constructor(obj = {}) {
        this.id = clients;
        this.socketID;
        this.xarr=[];
        this.yarr = [];
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.movement = {};
        this.URL = "static/test-clients/test-client-" + this.id + ".json";
    }

    move(dX, dY) {
        this.x += dX;
        this.z += dY;
    }
    remove(){
        delete clts[this.id];
    }

};


let clts = {};


io.on('connection', function (socket) {

    let client = null;
    console.log("connection success");
    socket.on('new-client', (config) => {
        console.log("clients# " + clients);
        client = new Client();
        client.id = client.id++;
        client.socketID = socket.id;
        clts[client.id] = client;

        // if (client) {
        //     fs.readFile(path.resolve(__dirname, client.URL), (err, data) => {
        //         if (err) return;
        //         else {
        //             let st = JSON.parse(data);
        //             client.x = st.x1;
        //             client.y = st.y1;
        //             client.xarr = st.xCrds;
        //             client.yarr = st.yCrds;
        //             console.log(client);
        //             console.log("clients# " + clients);
        //         }
        //     });
        // }
    });
    socket.on('update',  function(update){
        if (!clts[update.id]) {
            console.log("blah");
            var cl = new Client();
            cl.socketID = socket.id;
            clts[update.id] = cl;
        }
        clts[update.id].movement = update;
        console.log("bloo");

    });


    socket.on('disconnect', () => {
       console.log("disconnect");
       return;
    });
});

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
            break;
        }
    }
}


setInterval(function () {
   // sleep(1000);
    Object.values(clts).forEach((client) => {
        console.log(client.id);
        const mov = client.movement
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

}, 1000 / 30);

app.use('/static', express.static(__dirname + '/static'));

app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, '/static/index.html'));
});

server.listen(3000, function () {
    console.log('Starting server on port 3000');
});