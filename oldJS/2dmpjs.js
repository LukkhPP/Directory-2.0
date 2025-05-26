import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { location2d, nameDept } from '../buttonfunc.js';
import gsap from 'gsap';

let renderer, scene, overlayScene, camera, overlayCamera, controls;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let clock = new THREE.Clock();

let svgGroup, secondModel, humanmodel;
let isClicked = false;

let hasAnimated = false;
let lastPosition = { x: null, y: null, z: null };
const originalPosition = new THREE.Vector3(-70, 100, 0);
const originalRotation = new THREE.Euler(0, 0, 0);

const guiData = {
    currentURL: 'models/svg/tiger.svg',
    drawFillShapes: true,
    drawStrokes: true,
    fillShapesWireframe: false,
    strokesWireframe: false
};

init();

function init() {
    const container = document.getElementById('container2D');

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 0, 200);
    overlayCamera = camera.clone();

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.autoClear = false;
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 100;
    controls.maxDistance = 270;
    controls.screenSpacePanning = true;
    controls.minPolarAngle = Math.PI / 5.3;
    controls.maxPolarAngle = Math.PI / 1.2;
    controls.minAzimuthAngle = Math.PI / -2.3;
    controls.maxAzimuthAngle = Math.PI / 2.3;

    

    scene = new THREE.Scene();
    overlayScene = new THREE.Scene();

    window.addEventListener('resize', onWindowResize);
    loadSVG();
}

function loadSVG() {
    const loader = new SVGLoader();
    loader.load('Oldjs/2Dmap.svg', data => {
        svgGroup = new THREE.Group();
        svgGroup.scale.multiplyScalar(0.09);
        svgGroup.position.copy(originalPosition);
        svgGroup.scale.y *= -1;

        let renderOrder = 0;
        const styles = data.stylesheet ? parseCSS(data.stylesheet) : {};

        data.paths.forEach(path => {
            const className = path.userData.style.class || '';
            const styleProps = styles[className] || {};
            const fillColor = styleProps.fill || path.userData.style.fill;
            const strokeColor = styleProps.stroke || path.userData.style.stroke;
            const opacity = styleProps.opacity || path.userData.style.opacity;

            if (guiData.drawFillShapes && fillColor && fillColor !== 'none') {
                const mat = new THREE.MeshBasicMaterial({
                    color: new THREE.Color().setStyle(fillColor),
                    opacity: opacity !== undefined ? opacity : 1,
                    transparent: opacity < 1,
                    side: THREE.DoubleSide,
                    wireframe: guiData.fillShapesWireframe
                });

                SVGLoader.createShapes(path).forEach(shape => {
                    const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), mat);
                    mesh.renderOrder = renderOrder++;
                    svgGroup.add(mesh);
                });
            }

            if (guiData.drawStrokes && strokeColor && strokeColor !== 'none') {
                const mat = new THREE.MeshBasicMaterial({
                    color: new THREE.Color().setStyle(strokeColor),
                    opacity: opacity !== undefined ? opacity : 1,
                    transparent: opacity < 1,
                    side: THREE.DoubleSide,
                    wireframe: guiData.strokesWireframe
                });

                path.subPaths.forEach(subPath => {
                    const geometry = SVGLoader.pointsToStroke(subPath.getPoints(), path.userData.style);
                    if (geometry) {
                        const mesh = new THREE.Mesh(geometry, mat);
                        mesh.renderOrder = renderOrder++;
                        svgGroup.add(mesh);
                    }
                });
            }
        });

        scene.add(svgGroup);
        loadGLTFModel();
    });
}

function loadGLTFModel() {
    const loader = new GLTFLoader();
    loader.load('./public/location_pin.glb', gltf => {
        secondModel = gltf.scene;
        secondModel.scale.set(0.5, 0.5, 0.5);
        secondModel.position.set(20, 50, 0);

        secondModel.traverse(child => {
            if (child.isMesh) {
                child.material = new THREE.MeshBasicMaterial({
                    color: new THREE.Color("rgb(255, 0, 0)"),
                    depthTest: false,
                    depthWrite: false
                });
                child.renderOrder = 999;
            }
        });

        overlayScene.add(secondModel);
        secondModel.visible = false;
        setupEventListeners();
        animate();
    });
    
    
}

function parseCSS(style) {
    const styles = {};
    const regex = /\.([a-zA-Z0-9_-]+)/g;
    let match;

    while ((match = regex.exec(style)) !== null) {
        const className = match[1];
        const blockMatch = new RegExp(`\\.${className}\\s*\\{([^}]+)\\}`).exec(style);
        if (blockMatch) {
            const styleProps = {};
            blockMatch[1].split(';').forEach(decl => {
                const [prop, val] = decl.split(':').map(s => s.trim());
                if (prop && val) styleProps[prop] = val;
            });
            styles[className] = styleProps;
        }
    }

    return styles;
}

function setupEventListeners() {
    if (location2d) {
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('click', onMouseClick);
    } else {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('click', onMouseClick);
    }
}

function onMouseMove(event) {
    const container = document.getElementById('container2D');
    const rect = container.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(secondModel?.children || []);
    document.body.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
}

function onMouseClick() {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(secondModel?.children || []);

    if (intersects.length && !isClicked) {
        isClicked = true;
        const mesh = intersects[0].object;
        mesh.material.color.set("rgb(28, 78, 185)");
        mesh.scale.set(0.9, 0.9, 0.9);

        const sound = new Audio('./public/LocationPin.mp3');
        sound.volume = 0.4;
        sound.play();

        setTimeout(() => {
            mesh.scale.set(1, 1, 1);
            mesh.material.color.set("rgb(255, 0, 0)");
            isClicked = false;
        }, 300);

        setTimeout(() => {
            const modal = new bootstrap.Modal(document.getElementById('staticBackdrop'));
            modal.show();
            document.getElementById('staticBackdropLabel').textContent = nameDept;
        }, 300);
    }
}

function updateSecondModelVisibilityAndPosition() {
    if (secondModel && location2d) {
        const [x, y, z] = location2d.split(',').map(Number);
        const changed = lastPosition.x !== x || lastPosition.y !== y || lastPosition.z !== z;

        if (changed) {
            secondModel.position.set(x, y, z);
            secondModel.visible = true;
            lastPosition = { x, y, z };

            const sound = new Audio('./public/LocationPop.mp3');
            sound.volume = 0.15;
            setTimeout(() => sound.play(), 300);

            if (!hasAnimated) {
                hasAnimated = true;

                // Animate pin pop
                const scaleProxy = { x: 1, y: 1, z: 1 };
                gsap.to(scaleProxy, {
                    x: 0.5, y: 0.5, z: 0.5,
                    duration: 1,
                    ease: "elastic.out(1, 0.5)",
                    onUpdate: () => secondModel.scale.set(scaleProxy.x, scaleProxy.y, scaleProxy.z)
                });

                controls.reset();

            }


            setupEventListeners();
        }
    } else if (secondModel) {
        secondModel.visible = false;
        hasAnimated = false;
        lastPosition = { x: null, y: null, z: null };
        setupEventListeners();
    }
}

function onWindowResize() {
    const container = document.getElementById('container2D');
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    overlayCamera.aspect = width / height;
    overlayCamera.updateProjectionMatrix();

    renderer.setSize(width, height);
}

function animate() {
    requestAnimationFrame(animate);
    updateSecondModelVisibilityAndPosition();

    if (secondModel) {
        secondModel.lookAt(camera.position);
    }


    controls.update();
    overlayCamera.position.copy(camera.position);
    overlayCamera.rotation.copy(camera.rotation);
    renderer.clear();
    renderer.render(scene, camera);
    renderer.render(overlayScene, overlayCamera);
}

window.onload = () => {
    console.log('Page has loaded!');
    onWindowResize();
};
