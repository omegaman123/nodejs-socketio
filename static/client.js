'use strict';


const socket = io();
const canvas = $('#canvas-2d')[0];
const context = canvas.getContext('2d');
const canvas3d = $('#canvas-3d')[0];
const img = $('#img')[0];
var camera;
var renderer;
var scene;

function init() {

    renderer = new THREE.WebGLRenderer({canvas: canvas3d});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor('skyblue');
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    scene = new THREE.Scene();
    const floorGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
    const floorMaterial = new THREE.MeshLambertMaterial({color: 0xAAAAAA});
    const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    floorMesh.position.set(500, 0, 500);
    floorMesh.receiveShadow = true;
    floorMesh.rotation.x = -Math.PI / 2;
    scene.add(floorMesh);

    camera.position.set(1000, 600, 1000);
    camera.lookAt(floorMesh.position);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(-100, 300, -100);
    light.castShadow = true;
    light.shadow.camera.left = -2000;
    light.shadow.camera.right = 2000;
    light.shadow.camera.top = 2000;
    light.shadow.camera.bottom = -2000;
    light.shadow.camera.far = 2000;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    scene.add(light);
    const ambient = new THREE.AmbientLight(0x808080);
    scene.add(ambient);


    update();

    function update() {
        requestAnimationFrame(update);
        renderer.render(scene,camera);


        const clientMeshes = [];
        function gameStart() {
            socket.emit('game-start');
        }

        socket.on('connect', gameStart);
        socket.on('create-client', (client)=>{
            console.log(client.x + " " + client.y);
            var cGeo = new THREE.BoxGeometry(40,40,40);
            var cMat = new THREE.MeshLambertMaterial({color:0xFF00FF});
            var cl = new THREE.Mesh(cGeo,cMat);
            clientMeshes[client.id] = cl;
            cl.position.x = client.x+500;
            cl.position.y = 0;
            cl.position.z = client.y;
            cl.castShadow = true;
        });


        socket.on('state', (clts) => {
            Object.values(clts).forEach(client=>{
                var cl = clientMeshes[client.id];
                //scene.add(cl);
            });
        });
    }

}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.onload = init();
window.addEventListener('resize', onResize, false);






