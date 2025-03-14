import * as THREE from 'three'; 
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { locationxyz } from './buttonfunc.js'; // Assuming locationxyz is imported from an external module
import { nameDept } from './buttonfunc.js';
import gsap from "gsap";

console.log("GSAP:", gsap);  // Should not be undefined


let model, secondModel, humanmodel, FireExt, container, EmergeExit, content, raycaster, mouse, isClicked = false;
let trailGeometry, trailMaterial, trailLine, mixer, fovI;
let fireExtCopies = [];
let EmergeExitCopies = [];
let isTransparentCapitol = false; // Track transparency state

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
controls.saveState();

controls.update(); // Update controls

// Add Raycaster and Mouse
raycaster = new THREE.Raycaster();
mouse = new THREE.Vector2();
const direction = new THREE.Vector3();

// Setup GLTFLoader for the first model (Capitol)
const loader = new GLTFLoader();
loader.load(
    './public/Cap.glb', // Replace with your model's path
    function (gltf) {
        model = gltf.scene;
        model.position.set(40, -20, 20);
        model.scale.set(120,120,120);
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


function checkCollision() {
  if (!model) return true; 

 
  camera.getWorldDirection(direction);
  
  // Set Raycaster from camera position in the forward direction
  raycaster.set(camera.position, direction);

  // Get all meshes from the loaded GLTF model
  const meshes = [];
  model.traverse((child) => {
      if (child.isMesh) meshes.push(child);
  });

  // Check if the ray hits any part of the model
  const intersects = raycaster.intersectObjects(meshes, true);

  if (intersects.length > 0) {
        const distance = intersects[0].distance;

        if (distance < 2) { // If camera is too close
            if (!isTransparentCapitol) { // Only animate once
                console.log("❌ Collision detected! Making model transparent.");
                isTransparentCapitol = true;
               model.visible = false;
                
            }
            return false; // Prevent movement
        }
    } 
    
    // Restore opacity when no collision
    if (isTransparentCapitol) {
        console.log("✅ No collision! Restoring model opacity.");
        isTransparentCapitol = false;

        model.visible = true;
        
        
    }

    return true; // Allow movement
}

loader.load(
    './public/Whiteflag.glb', // Replace with your model's path
    function (gltf) {
        // Add the loaded model to the scene
        model = gltf.scene;
        model.position.set(45.9, 75, 20);
        model.scale.set(4,4,4);
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
                  color: new THREE.Color("rgb(24, 118, 214)"),
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

loader.load(
    './public/EmergeExit.glb',
    function (gltf5) {
        EmergeExit = gltf5.scene;
        EmergeExit.position.set(-168, -20, 10);
        EmergeExit.scale.set(2,2,2);
        EmergeExit.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = false;
                child.receiveShadow = false;
                child.material = new THREE.MeshBasicMaterial({
                    color: new THREE.Color("rgb(255, 136, 0)"),
                    depthTest: false,
                });
                child.renderOrder = 1;
                child.material.needsUpdate = true;
            }
        });
        EmergeExit.visible = false;
        scene.add(EmergeExit);
  
        // Create multiple copies of FireExt
        const positions = [
            [-100, -20, 50],
            [50, -20, 100],
            [100, -20, -50],
        ]; // Example positions for the copies
  
        positions.forEach((pos) => {
            const copy = EmergeExit.clone(); // Clone the original FireExt
            copy.position.set(...pos);
            EmergeExitCopies.push(copy);
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

const dirLight2 = new THREE.DirectionalLight(0x1876D6, 3);
dirLight2.position.set(-1, -1, -1);
scene.add(dirLight2);



const dirLight3 = new THREE.DirectionalLight(0xffffff, 3);
//dirLight3.position.set(-1, -1, -1);
scene.add(dirLight3);

function updateLightPosition() {
    gsap.to(dirLight3.position, {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
        duration: 1,  // Adjust duration as needed
        ease: "power2.out"
    });
}

const ambientLight = new THREE.AmbientLight(0x1876D6);
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
          const sound = new Audio('/public/LocationPin.mp3'); // Replace with your actual sound file path
             sound.volume = 0.4; // Adjust volume (0.0 to 1.0)
             sound.play()

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
          defines: { "USE_DASH": "" },
          depthTest: false,  // Completely ignore depth testing
    depthWrite: false, // Do not write to the depth buffer
    transparent: true, // Ensure proper blending
      });
      trailMaterial.renderOrder = 9999;

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
let hasAnimated = false; // Flag to track if animation has already played
let lastPosition = { x: null, y: null, z: null }; // Store last position

function updateSecondModelVisibilityAndPosition() {
  if (locationxyz) {
      const [x, y, z] = locationxyz.split(',').map(Number);
      const positionChanged = 
            lastPosition.x !== x || 
            lastPosition.y !== y || 
            lastPosition.z !== z;

        if (positionChanged) {
            secondModel.position.set(x, y, z);
            lastPosition = { x, y, z }; // Update last position
            secondModel.visible = true;
        }

      const sound = new Audio('/public/LocationPop.mp3'); // Adjust path based on your folder structure
        sound.volume = 0.15; // Set volume (0.0 to 1.0)
        const rangexyz = 1.4;
    
      if (!hasAnimated && positionChanged) {
        hasAnimated = true; // Mark animation as played
        controls.reset();
        // 🎯 Move the camera to a good position to look at secondModel
        const cameraOffset = { x: -(x-(x/rangexyz)), y: -(y-(y/rangexyz)), z: -(z-(z/rangexyz)) }; // Adjust distance
        gsap.to(camera.position, {
            x: cameraOffset.x,
            y: cameraOffset.y,
            z: cameraOffset.z,
            duration: 1,
            ease: "power2.out",
            onUpdate: () => {
                camera.lookAt(secondModel.position); // Face the model
            },
            onComplete: () => {
                camera.lookAt(secondModel.position); // Final correction
                
            }
        });

       
        

        const scaleProxy = { x: 3, y: 3, z: 3};

        setTimeout(() => {
            gsap.to(scaleProxy, {
                x: 1, y: 1, z: 1,
                duration: 1,
                ease: "elastic.out(1, 0.5)",
                onUpdate: () => secondModel.scale.set(scaleProxy.x, scaleProxy.y, scaleProxy.z)
            });
            sound.play();
            
          }, 300);
        hasAnimated = false;
        
        }

    if (trailLine) trailLine.visible = true;

      // Set up event listeners when locationxyz is valid
      setupEventListeners();
  } else {
      if (secondModel) secondModel.visible = false;
      if (trailLine) trailLine.visible = false;
      hasAnimated = false;
      lastPosition = { x: null, y: null, z: null }; // Reset position tracking
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

  const toggleButton2 = document.getElementById('whut');
  if (toggleButton2) {
    toggleButton2.addEventListener('click', toggleEmrgExtVisibility);
} else {
    console.error('Button with id "weel" not found');
}

});

function toggleFireExtVisibility() {
  if (FireExt) {
      const isVisible = !FireExt.visible;
      FireExt.visible = isVisible;

      // Toggle visibility for all copies
      fireExtCopies.forEach((copy) => {
          copy.visible = isVisible;
      });

  }
}

function toggleEmrgExtVisibility() {
    if (EmergeExit) {
        const isVisible = !EmergeExit.visible;
        EmergeExit.visible = isVisible;
  
        EmergeExitCopies.forEach((copy) => {
          copy.visible = isVisible;
      });
    }
  }

const clock = new THREE.Clock();


function animate() {
  requestAnimationFrame(animate);
  updateLightPosition();
  checkCollision();
  updateSecondModelVisibilityAndPosition();
  const delta = clock.getDelta(); // Get time difference since last frame
  if (mixer) mixer.update(delta); // Update mixer to progress animation

  if (secondModel && humanmodel) {
      secondModel.lookAt(camera.position);
      humanmodel.lookAt(camera.position);
      
      if (FireExt) {
        FireExt.lookAt(camera.position);

        // Ensure all copies also look at the camera
        fireExtCopies.forEach((copy) => {
            copy.lookAt(camera.position);
        });
    }

    if (EmergeExit) {
        EmergeExit.lookAt(camera.position);

        // Ensure all copies also look at the camera
        EmergeExitCopies.forEach((copy) => {
            copy.lookAt(camera.position);
        });
    }

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

  
    console.log("All functions returned true. Proceeding...");
    // Additional logic here if needed
    setTimeout(function() {
        document.body.classList.add("loaded");
      }, 2000);  // 500ms = 0.5 seconds

};

animate();