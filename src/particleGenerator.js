import * as THREE from "three";
import axios from "axios";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { getShader, getShaderWithAttrs } from "./shader/index";
var _ = require('lodash');

var positionBufferNames = ["pA", "pB", "pC", "pD", "pE", "pF", "pG", "pH"]

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
        }).catch((err) => {
            console.error("unable to load model: " + url, err);
            reject();
        });
    });
}

function createParticlesInScene(scene, modelUrls) {

    var promises = [];

    var allVertices = [];
    var vertexBuffers = [];
    var randomizeBuffer = [];

    modelUrls.forEach((url, urlIndex) => {
        let p = loadModel(url).then(result => {
            allVertices[urlIndex] = result;
        });
        promises.push(p);
    })
    
    return new Promise( function( resolve, reject ){

        Promise.all(promises).then(() => {
            // get model with maximum vertices; change buffer name at that index to "position":
            // (v shader stores position as vec3; I want to utilize that position attr
            // as the position of the model with the largest amount of vertices so that
            // the 4th coordinate (indicating particle existence) will unsurprisingly be 1)
            var maxVerticesCount = 0;
            var maxVerticesCountIndex = 0;
            allVertices.forEach((vs, i) => {
                if(vs.length > maxVerticesCount) {
                    maxVerticesCount = vs.length;
                    maxVerticesCountIndex = i;
                }
            })
            positionBufferNames[maxVerticesCountIndex] = "position";
            positionBufferNames.length = allVertices.length;
            console.log(positionBufferNames);
            
            // push data to each buffer
            allVertices.forEach(vertices => {
                // model 1
                var tempVertexBuffer = flattenAndEncode(vertices);
                // push more randomized "free" points around model
                // so that all points can map from one model to another
                for(let i = 0; i < maxVerticesCount - vertices.length; i++) {
                    let phi = rand(0, 2 * Math.PI);
                    let theta = rand(0, Math.PI);
                    let radius = rand(0, 100) + 100;
                    tempVertexBuffer.push(Math.cos(phi) * Math.sin(theta) * radius);
                    tempVertexBuffer.push(Math.sin(phi) * Math.sin(theta) * radius);
                    tempVertexBuffer.push(Math.cos(theta) * radius);
                    tempVertexBuffer.push(0.0); // this point needs to be hidden
                }
                vertexBuffers.push(tempVertexBuffer);
            })
    
            for(let i = 0; i < maxVerticesCount; i++) {
                randomizeBuffer.push(rand(0, 1));
            }
    
            const geo = new THREE.BufferGeometry();

            vertexBuffers.forEach((vertexBuffer, i) => {
                geo.setAttribute(
                    positionBufferNames[i],
                    new THREE.Float32BufferAttribute(vertexBuffer, 4)
                );
            })
            geo.setAttribute("randomize", new THREE.Float32BufferAttribute(randomizeBuffer, 1));
            
            // traverse through positionBufferNames to do 2 things:
            // 1. set uniforms; each position buffer needs to be assigned with a weight
            //    to operate the interpolation
            // 2. generate a dynamic vertex shader
            var uniforms = {
                rotateMatrix: { value: new THREE.Matrix4() }
            };
            var attr1 = ""; // dynamic v shader: an attribute and uniform for each position
            var attr2 = ""; // dynamic v shader: calculate the interpolated position with weights
            positionBufferNames.forEach(name => {
                uniforms[name + "Weight"] = {
                    value: 0.0
                };
                if(name != "position") {
                    attr1 += `attribute vec4 ${name};\nuniform float ${name}Weight;\n`;
                    attr2 += `        ${name} * ${name}Weight +\n`
                }
            });
            attr1 += `uniform float positionWeight;\n`;
            attr2 += `        vec4(position, 1.0) * positionWeight`

            const mat = new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: getShaderWithAttrs("vertexShader", [attr1, attr2]),
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

export { positionBufferNames, createParticlesInScene };
