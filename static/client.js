'use strict';


const socket = io();
const canvas = $('#canvas-2d')[0];
const context = canvas.getContext('2d');
const canvas3d = $('#canvas-3d')[0];
const img = $('#img')[0];

const renderer = new THREE.WebGLRenderer({canvas:canvas3d});
renderer.setClearColor('skyblue');
renderer.shadowMap.enabled = true;

var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);



function gameStart() {
    socket.emit('game-start');
}

$(document).on('keydown keyup', (event) => {

});


socket.on('state', (clts) => {
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.lineWidth = 10;
    context.beginPath();
    context.rect(0, 0, canvas.width, canvas.height);
    context.stroke();

    Object.values(clts).forEach((client) => {
        console.log(clts);
        var img1 = new Image();
        img1.src = '/static/client.gif';
        //context.drawImage(img1, client.x, client.y);
        context.font = '30px Bold Arial';
        context.fillText('Client ' + client.id, client.x, client.y - 20);
    });
});

socket.on('connect', gameStart);