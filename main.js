import * as THREE from 'three'; 
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { locationxyz } from './buttonfunc.js'; // Assuming locationxyz is imported from an external module
import { nameDept } from './buttonfunc.js';

let model, secondModel, humanmodel, FireExt, container, content, raycaster, mouse, isClicked = false;
let trailGeometry, trailMaterial, trailLine;

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
controls.maxDistance = 450;
controls.maxPolarAngle = Math.PI / 2;

controls.update(); // Update controls

// Add Raycaster and Mouse
raycaster = new THREE.Raycaster();
mouse = new THREE.Vector2();

// Setup GLTFLoader for the first model (Capitol)
const loader = new GLTFLoader();
loader.load(
    './public/Capitol.glb', // Replace with your model's path
    function (gltf) {
        model = gltf.scene;
        model.position.set(40, -20, 20);
        model.traverse((child) => {
            if (child.isMesh) {
                child.material.color.set(new THREE.Color("rgb(245, 247, 255)"));
            }
        });
        scene.add(model);
    },
    undefined,
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.error('An error happened', error);
    }
);

// Setup GLTFLoader for location pin model

loader.load(
    './public/location_pin.glb',
    function (gltf2) {
        secondModel = gltf2.scene;
        secondModel.position.set(40, -20, 20);
        secondModel.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = false;
                child.receiveShadow = false;
                child.material = new THREE.MeshBasicMaterial({
                    color: new THREE.Color("rgb(255, 0, 0)"),
                    depthTest: false,
                });
                child.renderOrder = 1;
                child.material.needsUpdate = true;
            }
        });
        scene.add(secondModel);

        // Create the trail after secondModel is loaded
        if (humanmodel) {
            createTrail();
        }
    },
    undefined,
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.error('An error happened', error);
    }
);


// Setup GLTFLoader for human model
loader.load(
  './public/human.glb',
  function (gltf3) {
      humanmodel = gltf3.scene;
      humanmodel.position.set(-168, -20, 80);
      humanmodel.traverse((child) => {
          if (child.isMesh) {
              child.castShadow = false;
              child.receiveShadow = false;
              child.material = new THREE.MeshBasicMaterial({
                  color: new THREE.Color("rgb(28, 78, 185)"),
                  depthTest: false,
              });
              child.renderOrder = 1;
              child.material.needsUpdate = true;
          }
      });
      scene.add(humanmodel);

      // Create the trail after humanmodel is loaded
      if (secondModel) {
          createTrail();
      }
  },
  undefined,
  function (xhr) {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  function (error) {
      console.error('An error happened', error);
  }
);

// Setup GLTFLoader for fire extinguisher model
loader.load(
  './public/FrExt.glb',
  function (gltf4) {
      FireExt = gltf4.scene;
      FireExt.position.set(-168, -20, 10);
      FireExt.traverse((child) => {
          if (child.isMesh) {
              child.castShadow = false;
              child.receiveShadow = false;
              child.material = new THREE.MeshBasicMaterial({
                  color: new THREE.Color("rgb(255, 0, 0)"),
                  depthTest: false,
              });
              child.renderOrder = 1;
              child.material.needsUpdate = true;
          }
      });
      FireExt.visible = false;
      scene.add(FireExt);
  },
  undefined,
  function (xhr) {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  function (error) {
      console.error('An error happened', error);
  }
);

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

// Mouse move event for hover
function setupEventListeners() {
  if (locationxyz) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('click', onMouseClick);
  } else {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onMouseClick);
  }
}

function onMouseMove(event) {
  const rect = container.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(secondModel ? secondModel.children : []);
  document.body.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
}

function onMouseClick() {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(secondModel ? secondModel.children : []);

  if (intersects.length > 0) {
      const clickedModel = intersects[0].object;

      if (!isClicked) {
          isClicked = true;
          clickedModel.material.color.set(new THREE.Color("rgb(28, 78, 185)"));
          clickedModel.scale.set(0.9, 0.9, 0.9);

          const header = document.getElementById('staticBackdropLabel');
          // Show Bootstrap modal
          const modal = new bootstrap.Modal(document.getElementById('staticBackdrop'));
          modal.show();
          header.textContent = nameDept;
          

          setTimeout(() => {
              clickedModel.scale.set(1, 1, 1);
              clickedModel.material.color.set(new THREE.Color("rgb(255, 0, 0)"));
              isClicked = false;
          }, 300);
      }
  }
}


// Modify trail creation to set visibility based on locationxyz
function createTrail() {
  if (secondModel && humanmodel) {
      const startPosition = secondModel.position;
      const endPosition = humanmodel.position;

      // Create geometry and set positions
      trailGeometry = new LineGeometry();
      trailGeometry.setPositions([
          startPosition.x, startPosition.y, startPosition.z,
          endPosition.x, endPosition.y, endPosition.z,
      ]);

      // Create material for dashed line
      const colors = [
          28 / 255, 78 / 255, 185 / 255, // Start color
          255 / 255, 0 / 255, 0 / 255,   // End color
      ];
      trailGeometry.setColors(colors);

      trailMaterial = new LineMaterial({
          vertexColors: true,
          linewidth: 8,
          dashSize: 4,
          gapSize: 3,
          defines: { "USE_DASH": "" }
      });

      trailMaterial.resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);

      trailLine = new Line2(trailGeometry, trailMaterial);
      trailLine.computeLineDistances();
      trailLine.needsUpdate = true;

      scene.add(trailLine);

      // Initial visibility setting based on locationxyz
      trailLine.visible = Boolean(locationxyz);
  }
}

// Function to update the position of the second model using locationxyz and manage visibility
// Update event listener setup whenever locationxyz changes
function updateSecondModelVisibilityAndPosition() {
  if (locationxyz) {
      const [x, y, z] = locationxyz.split(',').map(Number);
      secondModel.position.set(x, y, z);
      secondModel.visible = true;
      if (trailLine) trailLine.visible = true;

      // Set up event listeners when locationxyz is valid
      setupEventListeners();
  } else {
      if (secondModel) secondModel.visible = false;
      if (trailLine) trailLine.visible = false;

      // Remove event listeners if locationxyz is not defined
      setupEventListeners();
  }
}

// Ensure secondModel and trail are hidden initially
function initializeVisibility() {
  if (secondModel) secondModel.visible = false;
  if (trailLine) trailLine.visible = false;
}

document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('weeel');
  if (toggleButton) {
      toggleButton.addEventListener('click', toggleFireExtVisibility);
  } else {
      console.error('Button with id "weel" not found');
  }
});

function toggleFireExtVisibility() {
  if (FireExt) {
      FireExt.visible = !FireExt.visible;
  }
}

function animate() {
  requestAnimationFrame(animate);
  updateSecondModelVisibilityAndPosition();

  if (secondModel && humanmodel) {
      secondModel.lookAt(camera.position);
      humanmodel.lookAt(camera.position);
      FireExt.lookAt(camera.position);

      if (trailLine) {
          trailGeometry.setPositions([
              humanmodel.position.x, humanmodel.position.y, humanmodel.position.z,
              secondModel.position.x, secondModel.position.y, secondModel.position.z,
          ]);
          trailLine.computeLineDistances();
          trailMaterial.dashOffset -= 0.4;
      }
  }

  controls.update();
  renderer.render(scene, camera);
}

// Ensure initial visibility state is set after models load
window.onload = function () {
  console.log('Page has loaded!');
  onWindowResize();
  updateSecondModelVisibilityAndPosition();
  initializeVisibility();
};

animate();
