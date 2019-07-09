'use strict';

const socket = io();
const canvas = $('#canvas-2d')[0];
const context = canvas.getContext('2d');
const img = $('#img')[0];
var uniq = require('uniq');
let movement = {};
var data = [1,2,3,4,5,6,7,8,9];
console.log(uniq(data));
var csv = require('csv');


function gameStart(){
    socket.emit('game-start');
    console.log("Game start!");
}

$(document).on('keydown keyup', (event) => {
    const KeyToCommand = {
        'ArrowUp': 'forward',
        'ArrowDown': 'back',
        'ArrowLeft': 'left',
        'ArrowRight': 'right',
    };
    const command = KeyToCommand[event.key];
    if(command){
        if(event.type === 'keydown'){
            movement[command] = true;
        }else{ /* keyup */
            movement[command] = false;
        }
        socket.emit('movement', movement);
    }
});



socket.on('state', (players) => {
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.lineWidth = 10;
    context.beginPath();
    context.rect(0, 0, canvas.width, canvas.height);
    context.stroke();

    Object.values(players).forEach((player) => {
        var img1 = new Image();
        img1.src = '/static/client.gif';
        //context.drawImage(img1, player.x, player.y);
        context.font = '30px Bold Arial';
        context.fillText('Client' + player.id, player.x, player.y - 20);
    });
});

socket.on('connect', gameStart);