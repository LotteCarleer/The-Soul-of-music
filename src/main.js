import { Scene } from 'three/webgpu';
import { createRenderer } from './core/Renderer.js';
import { CameraRig } from './core/CameraRig.js';
import { startLoop } from './core/Loop.js';
import { createEnvironment } from './world/Environment.js';

const renderer = createRenderer();
const scene = new Scene();
const rig = new CameraRig();

createEnvironment(scene);

// Bij het vergroten/verkleinen van het venster: camera-verhouding en canvasgrootte
// aanpassen, anders wordt het beeld uitgerekt.
window.addEventListener('resize', () => {
  rig.resize();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

startLoop(renderer, scene, rig.camera, [(delta) => rig.update(delta)]);
