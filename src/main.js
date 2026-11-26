import { Scene } from 'three/webgpu';
import { createRenderer } from './core/Renderer.js';
import { CameraRig } from './core/CameraRig.js';
import { startLoop } from './core/Loop.js';
import { createEnvironment } from './world/Environment.js';

const renderer = createRenderer();
const scene = new Scene();
const rig = new CameraRig();

createEnvironment(scene);
import * as THREE from 'three/webgpu';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Piano } from './world/Piano.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07040d);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(3, 1.6, 4);

const renderer = new THREE.WebGPURenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);
await renderer.init();

// Environment map: een onzichtbare "kamer" die de piano weerspiegelt.
// Zonder iets om te weerspiegelen ziet zwarte lak er dof uit.
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.35; // laag houden, zodat de ruimte donker blijft

// Paars en roze licht, van twee kanten.
const purple = new THREE.PointLight(0x8b3dff, 40, 0, 2);
purple.position.set(-3, 2.5, 2);
scene.add(purple);

const pink = new THREE.PointLight(0xff4fa8, 40, 0, 2);
pink.position.set(3, 2, -2);
scene.add(pink);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const piano = new Piano();
scene.add(piano.group);
piano.load();

// Bij het vergroten/verkleinen van het venster: camera-verhouding en canvasgrootte
// aanpassen, anders wordt het beeld uitgerekt.
window.addEventListener('resize', () => {
  rig.resize();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

startLoop(renderer, scene, rig.camera, [(delta) => rig.update(delta)]);
const timer = new THREE.Timer();

renderer.setAnimationLoop(() => {
  timer.update();
  piano.update(timer.getElapsed());
  controls.update();
  renderer.render(scene, camera);
});
