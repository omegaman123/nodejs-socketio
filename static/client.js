'use strict';


const socket = io();
const canvas = $('#canvas-2d')[0];
const context = canvas.getContext('2d');
const canvas3d = $('#canvas-3d')[0];
const img = $('#img')[0];

var camera;
var scene;
var renderer;

function init(){
    camera  = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({canvas:canvas3d});
    renderer.setClearColor(new THREE.Color(0xEEEEEE));
    renderer.setSize(window.innerWidth, window.innerHeight);

    var planeGeometry = new THREE.PlaneGeometry(60, 60);
    var planeMaterial = new THREE.MeshBasicMaterial({color: 0xcccccc});
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);

    // rotate and position the plane
    plane.rotation.x = -0.5 * Math.PI;
    plane.position.x = 15;
    plane.position.y = 0;
    plane.position.z = 0;

    // add the plane to the scene
    scene.add(plane);

    camera.position.x = -30;
    camera.position.y = 40;
    camera.position.z = 30;
    camera.lookAt(scene.position);

    render();


    function render(){
        requestAnimationFrame(render);
        renderer.render(scene,camera);
    }

    function gameStart() {
        socket.emit('game-start');

    }

    socket.on('state', (clts) => {


        Object.values(clts).forEach((client) => {
            
        });
    });

    socket.on('connect', gameStart);

}





window.onload = init;