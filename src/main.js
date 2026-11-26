import { ACESFilmicToneMapping, PMREMGenerator, PointLight, Scene } from 'three/webgpu';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createRenderer } from './core/Renderer.js';
import { CameraRig } from './core/CameraRig.js';
import { startLoop } from './core/Loop.js';
import { createEnvironment } from './world/Environment.js';
import { Piano } from './world/Piano.js';

const renderer = createRenderer();
renderer.toneMapping = ACESFilmicToneMapping;
await renderer.init(); // nodig voordat de PMREMGenerator de renderer kan gebruiken

const scene = new Scene();
const rig = new CameraRig();

createEnvironment(scene);

// Environment map: een onzichtbare "kamer" die de piano weerspiegelt.
// Zonder iets om te weerspiegelen ziet zwarte lak er dof uit.
const pmrem = new PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.35; // laag houden, zodat de ruimte donker blijft

// Paars en roze licht, van twee kanten.
const purple = new PointLight(0x8b3dff, 40, 0, 2);
purple.position.set(-3, 2.5, 2);
scene.add(purple);

const pink = new PointLight(0xff4fa8, 40, 0, 2);
pink.position.set(3, 2, -2);
scene.add(pink);

const piano = new Piano();
scene.add(piano.group);
piano.load();

// Bij het vergroten/verkleinen van het venster: camera-verhouding en canvasgrootte
// aanpassen, anders wordt het beeld uitgerekt.
window.addEventListener('resize', () => {
  rig.resize();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

startLoop(renderer, scene, rig.camera, [
  (delta) => rig.update(delta),
  (_delta, elapsed) => piano.update(elapsed),
]);
