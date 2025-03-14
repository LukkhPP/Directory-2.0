// components/main.js
import * as THREE from 'three'; 
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createTrail, updateSecondModelVisibilityAndPosition, initializeVisibility, setupEventListeners, toggleFireExtVisibility } from './utils.js';
import { loadModels } from './models.js';

let container, scene, camera, renderer, controls, raycaster, mouse, isClicked = false;
let mixer, fireExtCopies = [];
let FireExt; // Declare FireExt here
const clock = new THREE.Clock();

container = document.getElementById('container3D');
scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera();
renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0);
scene.fog = new THREE.FogExp2(0xd6e3ff, 0.001);
container.appendChild(renderer.domElement);

// Setup OrbitControls
controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(-500, 900, 900);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 100;
controls.maxDistance = 450;
controls.maxPolarAngle = Math.PI / 2;
controls.update();

// Add Raycaster and Mouse
raycaster = new THREE.Raycaster();
mouse = new THREE.Vector2();

// Load models
loadModels(scene, fireExtCopies, (loadedModels) => {
    // Callback after models are loaded
    FireExt = loadedModels.FireExt; // Assign FireExt from loadedModels
    initializeVisibility(loadedModels);
});

// Add lights
const dirLight1 = new THREE.DirectionalLight(0xffffff, 3);
dirLight1.position.set(1, 1, 1);
scene.add(dirLight1);

const dirLight2 = new THREE.DirectionalLight(0x002288, 3);
dirLight2.position.set(-1, -1, -1);
scene.add(dirLight2);

const ambientLight = new THREE.AmbientLight(0x555555);
scene.add(ambientLight);

// Resize handler for responsiveness
function onWindowResize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

window.addEventListener('resize', onWindowResize);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    updateSecondModelVisibilityAndPosition();
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    controls.update();
    renderer.render(scene, camera);
}

// Set up event listener for toggling visibility
document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('weeel');
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            if (FireExt) { // Check if FireExt is defined
                toggleFireExtVisibility(FireExt, fireExtCopies); // Pass FireExt and fireExtCopies
            } else {
                console.error('FireExt is not defined');
            }
        });
    } else {
        console.error('Button with id "weeel" not found');
    }
});

// Start the application
window.onload = function () {
    console.log('Page has loaded!');
    onWindowResize();
    animate();
};