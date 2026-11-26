import { Timer } from 'three/webgpu';

// De animatielus: roept elke frame alle update-functies aan en tekent daarna de scène.
// delta = seconden sinds de vorige frame, elapsed = seconden sinds de start.
export function startLoop(renderer, scene, camera, updates = []) {
  const timer = new Timer();

  renderer.setAnimationLoop((timestamp) => {
    timer.update(timestamp);
    const delta = Math.min(timer.getDelta(), 0.1); // niet springen na een inactief tabblad
    const elapsed = timer.getElapsed();

    for (const update of updates) update(delta, elapsed);
    renderer.render(scene, camera);
  });
}
