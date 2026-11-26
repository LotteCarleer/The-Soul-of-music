import { WebGPURenderer } from 'three/webgpu';

// Maakt de WebGPURenderer en hangt het canvas in de pagina.
// TSL-shaders werken alleen met deze renderer: hij vertaalt de TSL-code naar
// WGSL (WebGPU) of, als de browser geen WebGPU heeft, automatisch naar GLSL (WebGL2).
export function createRenderer() {
  const renderer = new WebGPURenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  return renderer;
}
