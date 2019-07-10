'use strict';


const socket = io();
const canvas = $('#canvas-2d')[0];
const context = canvas.getContext('2d');
const canvas3d = $('#canvas-3d')[0];
const img = $('#img')[0];

var camera;
var scene;
var renderer;
let movement = {};

let controls = new function(){
    this.y = 100
};

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
    plane.position.x = 0;
    plane.position.y = 0;
    plane.position.z = 0;

    // add the plane to the scene
    scene.add(plane);

    camera.position.x = -30;
    camera.position.y = 40;
    camera.position.z = 30;
    camera.lookAt(scene.position);

    var axes = new THREE.AxisHelper(20);
    scene.add(axes);


    const Msh =[];
    var cGeo = new THREE.BoxGeometry(5,5,5);
    var cMat = new THREE.MeshLambertMaterial({color: 'black',wireframe:true});
    var cl = new THREE.Mesh(cGeo,cMat);

    function render(){
        requestAnimationFrame(render);
        renderer.render(scene,camera);
        socket.on('update-return',(clts)=>{
            Object.values(clts).forEach((client) => {
                if (!Msh[client.id]){
                    var p = cl.clone();
                    Msh[client.id] = p;
                    scene.add(p);
                }
                var c = Msh[client.id];
                c.position.x = client.x;
                c.position.z = client.z;
                c.position.y = client.y;

            });
        });

    }



    render();

    function gameStart() {
        socket.emit('new-client');
    }

    socket.on('connect', gameStart);

}
function resize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

$(document).on('keydown keyup', (event) => {
    const KeyToCommand = {
        'ArrowUp': 'up',
        'ArrowDown': 'down',
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
        socket.emit('update', movement);
    }


});


window.addEventListener('resize',resize,false);
window.onload = init;


