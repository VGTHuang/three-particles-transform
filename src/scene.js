import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { positionBufferNames, createParticlesInScene } from "./particleGenerator.js";

// container
const container = document.createElement("div");
document.getElementById("background").appendChild(container);

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
camera.position.z = 400;

// camera movement
var screenSizeX = window.innerWidth;
var screenSizeY = window.innerHeight;
var mousePosX = 0;
var mousePosY = 0;
var chasePosX = 0;
var chasePosY = 0;
const chaseSpeed = 0.01;
const cameraMoveRange = 200;
/**
 * slightly change camera position when mouse is moved
 */
function onMouseMove(val) {
    mousePosX = val.clientX;
    mousePosY = val.clientY;
}
function updateCameraPos() {
    chasePosX += chaseSpeed * (mousePosX - chasePosX);
    chasePosY += chaseSpeed * (mousePosY - chasePosY);
    camera.position.x = -(chasePosX - mousePosX) / (screenSizeX + screenSizeY) * cameraMoveRange;
    camera.position.y = (chasePosY - mousePosY) / (screenSizeX + screenSizeY) * cameraMoveRange;
}

// scene
const scene = new THREE.Scene();

// renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha:true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0, 0, 0, 0);
container.appendChild(renderer.domElement);

function onWindowResize() {
    screenSizeX = window.innerWidth;
    screenSizeY = window.innerHeight;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

var timeCount = 0;
var rotateAxis = new THREE.Vector3(0, 1, 0);
var rotateSpeed = 0.015;
var rotateMatrix = new THREE.Matrix4();
var transitionSpeed = 0.01;

// ***smooth transition***
// each one is an n-dimension vector (n = numbers of models)
// with sPosition indicating the "distance" from the current ***state***
// to each fixed state (point cloud of each model); a weighted sum of each fixed state
// is the current state.
// sDestination suggests which state is "attracting" the current state;
// the sPosition should move smoothly towards the destination in a certain fashion
var sCoefficients = [];
var sVelocity = [];
var sPosition = [];
var sDestination = 0;
var sDestinationCount;
var transitionTime = 1;

/**
 * initialize the transition params
 * @param len number of models (states)
 */
function genTransitionParams(len) {
    sDestinationCount = len;
    sCoefficients = new Array(len).fill('').map(d => new Array(4).fill(0))
    sVelocity = new Array(len).fill(0);
    sPosition = new Array(len).fill(0);
    sPosition[0] = 1;
    updateShaderWeights();
}

/**
 * do smooth transition with cubic function
 * s(t) = coefficients[0]*t^3 + coefficients[1]*t^2 + coefficients[2]*t + coefficients[3]
 * t = 0: s = pos0, ds/dt = velocity
 * t = 1: s = pos1, ds/dt = 0
 * pulling t = transitionTime into s(t) gives the current position.
 * essentially, this function is to solve the augmented matrix
 * | 1 1 1 1 : pos1     |
 * |       1 : pos0     |
 * | 3 2 1 0 : 0        |
 * |     1   : velocity |
 * @param {*} coefficients the coefficients to be updated
 * @param {*} velocity current velocity
 * @param {*} pos0 current position
 * @param {*} pos1 target position
 */
function updateCoefficient(coefficients, velocity, pos0, pos1) {
    coefficients[3] = pos0;
    coefficients[2] = velocity;
    var w = pos1 - pos0 - velocity;
    var x = -velocity;
    coefficients[0] = x - 2 * w;
    coefficients[1] = 3 * w - x;
}

/**
 * basically, it's to solve the differential of cubic function s(t) at t=transitionTime
 * coefficients = [a,b,c,d]
 * ds(t)/dt = 3ax^2+2bx+c
 */
 function getVelocity(coefficients) {
    var r = 3 * coefficients[0] * transitionTime + 2 * coefficients[1];
    r = r * transitionTime + coefficients[2];
    return r;
}

/**
 * basically, it's to solve cubic function s(t) at t=transitionTime
 * coefficients = [a,b,c,d]
 * s(t) = ax^3+bx^2+cx+d
 */
function getPosition(coefficients) {
    var r = coefficients[0] * transitionTime + coefficients[1];
    r = r * transitionTime + coefficients[2];
    r = r * transitionTime + coefficients[3];
    return r;
}

function updateTransition() {
    if(transitionTime >= 1) {
        // converged to a state: stop updating.
        if(transitionTime > 1) {
            // floating point errors: transitionTime = 1.000000...3
            // calibrate the state
            for(let i = 0; i < sPosition.length; i++) {
                sVelocity[i] = 0;
                sPosition[i] = (i == sDestination) ? 1 : 0;
            }
            transitionTime = 1;
        }
        return;
    }
    else {
        // update coefficients if the destination has just changed
        if(transitionTime == 0) {
            for(let i = 0; i < sPosition.length; i++) {
                updateCoefficient(sCoefficients[i], sVelocity[i], sPosition[i],
                    i == sDestination ? 1 : 0);
            }
        }
        // update transition
        for(let i = 0; i < sPosition.length; i++) {
            sVelocity[i] = getVelocity(sCoefficients[i]);
            sPosition[i] = getPosition(sCoefficients[i]);
        }
        // check if transition is complete
        transitionTime += transitionSpeed;
        updateShaderWeights();
    }
}

/**
 * passes the values in sPosition to shader
 */
function updateShaderWeights() {
    positionBufferNames.forEach((name, i) => {
        material.uniforms[name + "Weight"].value = sPosition[i];
    })
}

function render() {
    // rotate
    // let angle = (Math.PI * 2 * timeCount) / 100;
    // rotateMatrix.makeRotationAxis(rotateAxis, angle);
    // material.uniforms.rotateMatrix.value.copy(rotateMatrix);

    updateTransition();
    updateCameraPos();

    camera.lookAt(scene.position);

    renderer.render(scene, camera);

    timeCount += rotateSpeed;
    timeCount %= 100;
}

var myReq = null;

function animate() {
    myReq = requestAnimationFrame(animate);

    render();
    stats.update();
}

function stopAnimate() {
    cancelAnimationFrame(myReq);
}

window.addEventListener("resize", onWindowResize);
window.addEventListener("mousemove", onMouseMove);

var material = undefined;

// get coords of each model and generate particles
function startScene(modelUrlList) {
    createParticlesInScene(scene, modelUrlList).then((res) => {
        material = res.material;
        genTransitionParams(modelUrlList.length);
        animate();
    });
}

/**
 * changes the destination state
 */
function transformModel(val) {
    sDestination = (sDestination + val + sDestinationCount) % sDestinationCount;
    transitionTime = 0;
}

export { startScene, transformModel };