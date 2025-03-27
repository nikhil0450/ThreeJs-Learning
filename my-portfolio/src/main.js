// import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.174.0/build/three.module.js";
import * as THREE from "three";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement)

// console.log(scene);
// console.log(camera);
// console.log(renderer);

// Creating a box

const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00});
const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);

console.log(boxGeometry);
console.log(boxMaterial);
console.log(boxMesh);

scene.add(boxMesh);
camera.position.z = 4
renderer.render(scene, camera)

