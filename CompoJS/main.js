import * as THREE from 'three'; 
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { locationxyz } from './buttonfunc.js'; // Assuming locationxyz is imported from an external module
import { nameDept } from './buttonfunc.js';

let model, secondModel, humanmodel, FireExt, container, content, raycaster, mouse, isClicked = false;
let trailGeometry, trailMaterial, trailLine, mixer;
let fireExtCopies = [];

// Setup scene, camera, renderer
container = document.getElementById('container3D');
content = document.getElementById('container3D');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera();
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true});
renderer.setClearColor(0x000000, 0);
//scene.background = new THREE.Color(0xd6e3ff);
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
    './public/kuyba.glb', // Replace with your model's path
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

loader.load(
    './public/scene.glb', // Replace with your model's path
    function (gltf) {
        // Add the loaded model to the scene
        model = gltf.scene;
        model.position.set(39.5, 58.7, 42.8);
        model.scale.set(3,3,3);
        model.traverse((child) => {
            if (child.isMesh) {
                child.material.color.set(new THREE.Color("rgb(245, 247, 255)"));
            }
        });
        scene.add(model);

        // Initialize the mixer if animations are present
        if (gltf.animations && gltf.animations.length) {
            mixer = new THREE.AnimationMixer(model);
            const action = mixer.clipAction(gltf.animations[0]); // Use the first animation clip
            action.play();
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

      // Create multiple copies of FireExt
      const positions = [
          [-100, -20, 50],
          [50, -20, 100],
          [100, -20, -50],
      ]; // Example positions for the copies

      positions.forEach((pos) => {
          const copy = FireExt.clone(); // Clone the original FireExt
          copy.position.set(...pos);
          fireExtCopies.push(copy); // Add to array
          scene.add(copy); // Add to scene
      });
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

