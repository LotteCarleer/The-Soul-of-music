import { PerspectiveCamera, Vector2, Vector3 } from 'three/webgpu';

// Een camera die zacht "naijlt" achter de muis.
// - target:  waar de muis nu is (-1..1 op beide assen)
// - current: waar de camera nu is; schuift elke frame een stukje richting target
export class CameraRig {
  constructor({
    basePosition = new Vector3(0, 1.5, 6),
    lookAt = new Vector3(0, 2, -4),
    amplitude = new Vector2(1.2, 0.6), // hoe ver de camera maximaal opzij/omhoog schuift
    smoothing = 2.5, // hoger = volgt sneller, lager = trager naijlen
  } = {}) {
    this.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    this.basePosition = basePosition;
    this.lookAtPoint = lookAt;
    this.amplitude = amplitude;
    this.smoothing = smoothing;

    this.target = new Vector2();
    this.current = new Vector2();

    this.camera.position.copy(basePosition);
    this.camera.lookAt(lookAt);

    window.addEventListener('pointermove', (event) => {
      // Muispositie omzetten naar -1..1 (midden van het scherm = 0)
      this.target.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.target.y = -((event.clientY / window.innerHeight) * 2 - 1);
    });
  }

  update(delta) {
    // Easing: elke frame een fractie van de resterende afstand afleggen.
    // Met exp() is die fractie afhankelijk van de tijd tussen frames, zodat
    // de beweging even snel voelt op 60 Hz als op 120 Hz.
    const t = 1 - Math.exp(-this.smoothing * delta);
    this.current.lerp(this.target, t);

    this.camera.position.set(
      this.basePosition.x + this.current.x * this.amplitude.x,
      this.basePosition.y + this.current.y * this.amplitude.y,
      this.basePosition.z,
    );
    // Blijf naar hetzelfde punt kijken: zo bewegen dichte gordijnen meer dan verre (parallax).
    this.camera.lookAt(this.lookAtPoint);
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }
}
