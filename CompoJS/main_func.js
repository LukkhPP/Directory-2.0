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
    const isVisible = !FireExt.visible;
    FireExt.visible = isVisible;

    // Toggle visibility for all copies
    fireExtCopies.forEach((copy) => {
        copy.visible = isVisible;
    });
}
}

const clock = new THREE.Clock();


function animate() {
requestAnimationFrame(animate);
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