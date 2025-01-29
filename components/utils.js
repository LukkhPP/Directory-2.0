// components/utils.js
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { locationxyz } from './buttonfunc.js'; // Assuming locationxyz is imported from an external module
import { nameDept } from './buttonfunc.js';

let trailGeometry, trailMaterial, trailLine;

export function createTrail(scene, secondModel, humanmodel) {
    if (secondModel && humanmodel) {
        const startPosition = secondModel.position;
        const endPosition = humanmodel.position;

        trailGeometry = new LineGeometry();
        trailGeometry.setPositions([
            startPosition.x, startPosition.y, startPosition.z,
            endPosition.x, endPosition.y, endPosition.z,
        ]);

        const colors = [
            28 / 255, 78 / 255, 185 / 255,
            255 / 255, 0 / 255, 0 / 255,
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
        scene.add(trailLine);
        trailLine.visible = Boolean(locationxyz);
    }
}

export function updateSecondModelVisibilityAndPosition(secondModel) {
    if (locationxyz) {
        const [x, y, z] = locationxyz.split(',').map(Number);
        secondModel.position.set(x, y, z);
        secondModel.visible = true;
        if (trailLine) trailLine.visible = true;
        setupEventListeners();
    } else {
        if (secondModel) secondModel.visible = false;
        if (trailLine) trailLine.visible = false;
        setupEventListeners();
    }
}

export function initializeVisibility(models) {
    if (models.secondModel) models.secondModel.visible = false;
    if (trailLine) trailLine.visible = false;
}

export function setupEventListeners() {
    // Add mouse move and click event listeners
}

export function toggleFireExtVisibility(FireExt, fireExtCopies) {
    if (FireExt) {
        const isVisible = !FireExt.visible;
        FireExt.visible = isVisible;

        if (Array.isArray(fireExtCopies)) {
            fireExtCopies.forEach((copy) => {
                copy.visible = isVisible;
            });
        } else {
            console.error('fireExtCopies is not defined or is not an array');
        }
    } else {
        console.error('FireExt is not defined');
    }
}