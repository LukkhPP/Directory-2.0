import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let model, container, content;

// Setup scene, camera, renderer
container = document.getElementById('container3D');
content = document.getElementById('container3D');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera();
const renderer = new THREE.WebGLRenderer({ antialias: true });
scene.background = new THREE.Color(0xd6e3ff);
scene.fog = new THREE.FogExp2(0xd6e3ff, 0.001);

// Append renderer to the container div (not to the body)

container.appendChild(renderer.domElement);

// Setup OrbitControls

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(-500, 900, 900); // Set the camera position

controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 100;
controls.maxDistance = 350;
controls.maxPolarAngle = Math.PI / 2;

controls.update();  // Update controls

// Setup GLTFLoader
const loader = new GLTFLoader();
loader.load(
    './public/Capitol.glb',  // Replace with your model's path
    function(gltf) {
      model = gltf.scene;

      model.position.set(40, -20, 20);

      // Traverse the model and change the material color
        model.traverse((child) => {
          if (child.isMesh) {
            child.material.color.set(new THREE.Color("rgb(245, 247, 255)"));
         }
        });
        scene.add(model);  // Add the model to the scene
    },
    undefined,
    function (xhr) {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
      console.error('An error happened', error);
    }
);

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
    
    // Update camera aspect ratio
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    // Update renderer size
    renderer.setSize(width, height);
    
}


window.addEventListener('resize', onWindowResize);

// Animate and render
function animate() {
    requestAnimationFrame(animate);
    controls.update();  // Update controls for smooth movement
    renderer.render(scene, camera);
    onWindowResize()
}

animate();

window.onload = function() {
  // Your code here
  console.log('Page has loaded!');
  onWindowResize();
};
