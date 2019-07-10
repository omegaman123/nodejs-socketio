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
        this.id = ++clients;
        this.socketID;
        this.xarr=[];
        this.yarr = [];
        this.x = 100;
        this.y = 100;
        this.URL = "static/test-clients/test-client-" + this.id + ".json";
    }

    move(dX, dY) {
        this.x += dX;
        this.y += dY;
    }

};



let players = {};
let clts = {};


io.on('connection', function (socket) {
    let player = null;
    let client = null;
    console.log("connection success");
    socket.on('game-start', (config) => {
        client = new Client();
        client.socketID = socket.id;
        clts[client.id] = client;
        if (client) {
            fs.readFile(path.resolve(__dirname, client.URL), (err, data) => {
                if (err) throw err;
                else {
                    let st = JSON.parse(data);
                    console.log(st);
                    client.x = st.x1;
                    client.y = st.y1;
                    client.xarr = st.xCrds;
                    client.yarr = st.yCrds;
                    console.log(client);
                }
            });
        }
    });
    socket.on('movement', function (movement) {
        if (!player || !client) {
            return;
        }
        console.log(client);
    });
    socket.on('new-client',function(){
        console.log("12345");
        client = new Client();
        client.socketID = socket.id;
        clts[client.id] = client;
        if (client) {
            fs.readFile(path.resolve(__dirname, client.URL), (err, data) => {
                if (err) throw err;
                else {
                    let st = JSON.parse(data);
                    console.log(st);
                    client.x = st.x1;
                    client.y = st.y1;
                    client.xarr = st.xCrds;
                    client.yarr = st.yCrds;
                    console.log(client);
                }
            })
        }
    });

    socket.on('disconnect', () => {
        if (client) {
            console.log("client : " + client.name + " disconnected")
            delete clts[client.id];
            client = null;
            --clients;
        }
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
    Object.values(clts).forEach((client) => {

        if ((client.xarr[0]) != null){
                client.x = client.xarr[0]
                client.xarr.shift();
        }
        if (( client.yarr[0]) != null){
            client.y = client.yarr[0]
            client.yarr.shift();
        }
        //sleep(1000);


    });
    io.sockets.emit('state', clts);

}, 1000 / 30);

app.use('/static', express.static(__dirname + '/static'));

app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, '/static/index.html'));
});

server.listen(3000, function () {
    console.log('Starting server on port 3000');
});