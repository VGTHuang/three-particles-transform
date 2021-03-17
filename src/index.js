import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { positionBufferNames, createParticlesInScene } from "./particleGenerator.js";

// container
const container = document.createElement("div");
document.body.appendChild(container);

// stats
const stats = new Stats();
container.appendChild(stats.dom);

// camera
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    10000
);
camera.position.z = 300;

// scene
const scene = new THREE.Scene();

// renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

var timeCount = 0;
var rotateAxis = new THREE.Vector3(0, 1, 0);
var rotateSpeed = 0.015;
var rotateMatrix = new THREE.Matrix4();

// physics

/**
 * generate some physics params for v shader interpolation
 */
function genPhysics() {

}

function render() {
    // rotate
    let angle = (Math.PI * 2 * timeCount) / 100;
    rotateMatrix.makeRotationAxis(rotateAxis, angle);
    material.uniforms.rotateMatrix.value.copy(rotateMatrix);
    
    // calc interpolate factor
    let interpolate = Math.sin(angle*5) * 1.1;
    if(interpolate > 1.0) {
        interpolate = 1.0;
    }
    else if(interpolate < -1.0) {
        interpolate = -1.0;
    }
    interpolate = interpolate * 0.5 + 0.5;

    material.uniforms[positionBufferNames[0]+"Weight"].value = interpolate;
    material.uniforms[positionBufferNames[2]+"Weight"].value = 1 - interpolate;

    camera.lookAt(scene.position);

    renderer.render(scene, camera);

    timeCount += rotateSpeed;
    timeCount %= 100;
}

var isAnimate = true;
var myReq = null;

function animate() {
    myReq = requestAnimationFrame(animate);

    render();
    stats.update();
}

function stopAnimate() {
    cancelAnimationFrame(myReq);
}

document.getElementById("toggle-btn").addEventListener("click", () => {
    if(isAnimate) {
        isAnimate = false;
        stopAnimate();
    }
    else {
        isAnimate = true;
        animate();
    }
})

window.addEventListener("resize", onWindowResize);
window.addEventListener("wheel", windowWheel);

var material = undefined;
var particles = undefined;
var modelUrls = [
    "/dist/models/cube1.txt",
    "/dist/models/torus.txt",
    "/dist/models/sphere1.txt"
]

// get coords of each model and generate particles
createParticlesInScene(scene, modelUrls).then((res) => {
    particles = res.object;
    material = res.material;
    genPhysics(modelUrls.len);
    animate();
});

function windowWheel(val) {
    console.log(val.deltaY);
    if(val.deltaY > 0) {
        transformModel(1);
    }
    else {
        transformModel(-1);
    }
}

function transformModel(val) {
    interpolateDir = val;
}