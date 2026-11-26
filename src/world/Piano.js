import * as THREE from 'three/webgpu';
import { color, float } from 'three/tsl';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Hoe breed (in meters) de piano in de wereld wordt, en hoe hoog hij zweeft.
const PIANO_WIDTH = 2.5;
const FLOAT_HEIGHT = 0.1; // hoe ver hij op en neer gaat
const FLOAT_SPEED = 0.8; // hoe snel hij deint

export class Piano {
  constructor() {
    // Een lege "houder". De piano komt erin zodra het model geladen is,
    // zodat we hem meteen aan de scène kunnen toevoegen.
    this.group = new THREE.Group();
    this.baseY = 0;
  }

  async load(url = '/model/grand_piano.glb') {
    const gltf = await new GLTFLoader().loadAsync(url);
    const model = gltf.scene;

    this.#makeBlackGlossy(model);
    this.#centerAndScale(model);

    this.group.add(model);
    return this;
  }

  // Het model heeft een materiaal dat "black_piano" heet: de zwarte kast.
  // Dat vervangen we door een TSL-materiaal dat werkt als zwarte pianolak.
  #makeBlackGlossy(model) {
    const lacquer = new THREE.MeshPhysicalNodeMaterial();
    lacquer.colorNode = color(0x050505); // bijna zwart (puur zwart oogt plat)
    lacquer.metalnessNode = float(0.0); // lak is geen metaal
    lacquer.roughnessNode = float(0.12); // laag = glad = scherpe reflecties
    lacquer.clearcoat = 1.0; // extra glanslaag bovenop, zoals echte lak
    lacquer.clearcoatRoughness = 0.03;

    model.traverse((child) => {
      if (child.isMesh && child.material?.name === 'black_piano') {
        child.material = lacquer;
      }
    });
  }

  // Het model is in andere eenheden gemaakt. We meten hoe groot het is,
  // schalen het naar PIANO_WIDTH en zetten het midden op (0, 0, 0).
  #centerAndScale(model) {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const scale = PIANO_WIDTH / Math.max(size.x, size.z);
    model.scale.multiplyScalar(scale);

    box.setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
  }

  // Elke frame aanroepen met de tijd in seconden: zo deint de piano.
  update(time) {
    this.group.position.y = this.baseY + Math.sin(time * FLOAT_SPEED) * FLOAT_HEIGHT;
    // Een heel klein beetje kantelen maakt het zweven natuurlijker.
    this.group.rotation.z = Math.sin(time * FLOAT_SPEED * 0.5) * 0.02;
  }
}
