// components/models.js
import * as THREE from 'three'; // Import THREE
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function loadModels(scene, fireExtCopies, callback) {
    const loader = new GLTFLoader();
    let models = {};

    // Load Capitol Model
    loader.load('./public/kuyba.glb', (gltf) => {
        models.capitol = gltf.scene;
        models.capitol.position.set(40, -20, 20);
        scene.add(models.capitol);
    });

    // Load Scene Model
    loader.load('./public/scene.glb', (gltf) => {
        models.scene = gltf.scene;
        models.scene.position.set(39.5, 58.7, 42.8);
        models.scene.scale.set(3, 3, 3);
        scene.add(models.scene);
        if (gltf.animations && gltf.animations.length) {
            models.mixer = new THREE.AnimationMixer(models.scene);
            const action = models.mixer.clipAction(gltf.animations[0]);
            action.play();
        }
    });

    // Load Human Model
    loader.load('./public/human.glb', (gltf) => {
        models.human = gltf.scene;
        models.human.position.set(1-168, -20, 80); // Adjust position as needed
        models.human.scale.set(1, 1, 1); // Adjust scale as needed
        scene.add(models.human);
    });

    // Load FrExt Model
    loader.load('./public/FrExt.glb', (gltf4) => {
        const FireExt = gltf4.scene; // Define FireExt here
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

        FireExt.visible = false; // Initially hide the original model
        scene.add(FireExt); // Add the original model to the scene

        // Create multiple copies of FireExt
        const positions = [
            [-100, -20, 50],
            [50, -20, 100],
            [100, -20, -50],
        ]; 

        positions.forEach((pos) => {
            const copy = FireExt.clone(); // Clone the original FireExt
            copy.position.set(...pos); // Set the position of the copy
            fireExtCopies.push(copy); // Add to the array of copies
            scene.add(copy); // Add the copy to the scene
        });

        
        models.FireExt = FireExt; // Add FireExt to the models object


        callback(models);
    },
    undefined,
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.error('An error happened', error);
    });
}