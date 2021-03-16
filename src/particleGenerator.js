import * as THREE from "three";
import axios from "axios";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { getShader } from "./shader/index";
var _ = require('lodash');

function rand(min, max) {
    return Math.random() * (max - min) + min;
}

function reshape(array, n){
    var comp = _.compact(array.map(function(el, i) {
        if (i % n === 0) {
            return array.slice(i, i + n);
        }
    }));
    if(comp[comp.length - 1].length < n) {
        comp.length = comp.length - 1;
    }
    return comp;
}

function flattenAndEncode(array){
    var flat = _.flatten(array.map(el => {
        return el.concat(1.0); // this point needs to be visible
    }));
    return flat;
}

function loadModel(url) {
    return new Promise( function( resolve, reject ){
        axios.get(url).then(res => {
            var objVertices = eval(res.data);
            objVertices = reshape(objVertices, 3);
            objVertices = _.shuffle(objVertices);
            // _.shuffle(objVertices);
            resolve(objVertices);
        }).catch(() => {
            console.error("unable to load model: " + url);
            reject();
        });
    });
}

function createParticlesInScene(scene) {

    var promises = [];

    var allVertices = [];
    var vertexBufferA = [];
    var vertexBufferB = [];
    var randomizeBuffer = [];

    let p1 = loadModel('/dist/models/sphere1.txt').then(result => {
        allVertices[0] = result;
    });
    promises.push(p1);

    let p2 = loadModel('/dist/models/cube1.txt').then(result => {
        allVertices[1] = result;
    });
    promises.push(p2);
    return new Promise( function( resolve, reject ){

        Promise.all(promises).then(() => {
            // get model with maximum vertices
            var maxVerticesCount = 0;
            allVertices.forEach(vs => {
                if(vs.length > maxVerticesCount) {
                    maxVerticesCount = vs.length;
                }
            })
            // push data to buffer
    
            // model 1
            vertexBufferA = flattenAndEncode(allVertices[0]);
            // push more randomized "free" points around model
            // so that all points can map from one model to another
            for(let i = 0; i < maxVerticesCount - allVertices[0].length; i++) {
                let phi = rand(0, 2 * Math.PI);
                let theta = rand(0, Math.PI);
                let radius = rand(0, 100) + 100;
                vertexBufferA.push(Math.cos(phi) * Math.sin(theta) * radius);
                vertexBufferA.push(Math.sin(phi) * Math.sin(theta) * radius);
                vertexBufferA.push(Math.cos(theta) * radius);
                vertexBufferA.push(0.0); // this point needs to be hidden
            }
    
            // model 2
            vertexBufferB = flattenAndEncode(allVertices[1]);
            // push more randomized "free" points around model
            // so that all points can map from one model to another
            for(let i = 0; i < maxVerticesCount - allVertices[1].length; i++) {
                let phi = rand(0, 2 * Math.PI);
                let theta = rand(0, Math.PI);
                let radius = rand(0, 100) + 100;
                vertexBufferB.push(Math.cos(phi) * Math.sin(theta) * radius);
                vertexBufferB.push(Math.sin(phi) * Math.sin(theta) * radius);
                vertexBufferB.push(Math.cos(theta) * radius);
                vertexBufferB.push(0.0); // this point needs to be hidden
            }
    
            for(let i = 0; i <maxVerticesCount; i++) {
                randomizeBuffer.push(rand(0, 1));
            }
    
            const geo = new THREE.BufferGeometry();
    
            geo.setAttribute("position", new THREE.Float32BufferAttribute(vertexBufferA, 4));
            geo.setAttribute("pB", new THREE.Float32BufferAttribute(vertexBufferB, 4));
            geo.setAttribute("randomize", new THREE.Float32BufferAttribute(randomizeBuffer, 1));
    
            const mat = new THREE.ShaderMaterial({
                uniforms: {
                      time: { value: 0.0 },
                },
                vertexShader: getShader("vertexShader"),
                fragmentShader: getShader("fragmentShader"),
                blending: THREE.AdditiveBlending,
                depthTest: false,
                transparent: true,
                vertexColors: true,
            });
            var mesh = new THREE.Points(geo, mat);
            scene.add(mesh);

            resolve({
                "object": mesh,
                "material": mat
            });
        });
    });

}

export { createParticlesInScene };
