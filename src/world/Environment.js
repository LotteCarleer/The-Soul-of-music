import { Fog, Group } from 'three/webgpu';
import { color, mix, smoothstep, screenUV } from 'three/tsl';
import { createLightCurtain } from './LightCurtain.js';

export const PALETTE = {
  midnight: '#090817',
  deepPurple: '#160B45',
  violet: '#3210A1',
  indigo: '#3429D9',
  pink: '#F05ACF',
};

// Gordijnen in drie lagen achter elkaar (vooraan, midden, achteraan).
// Verre lagen zijn breder en vervagen meer, dat geeft diepte en parallax.
const CURTAINS = [
  // voorste laag
  { x: -4.5, z: -1, width: 3, bottom: PALETTE.pink, top: PALETTE.violet, phase: 0.0 },
  { x: 4.2, z: -1.5, width: 3, bottom: PALETTE.indigo, top: PALETTE.violet, phase: 2.1 },
  // middelste laag
  { x: -6.5, z: -5, width: 3.5, bottom: PALETTE.indigo, top: PALETTE.violet, phase: 4.3 },
  { x: -1.8, z: -5.5, width: 3.5, bottom: PALETTE.pink, top: PALETTE.indigo, phase: 1.2 },
  { x: 2.6, z: -5, width: 3.5, bottom: PALETTE.violet, top: PALETTE.indigo, phase: 3.4 },
  { x: 7.2, z: -5.5, width: 3.5, bottom: PALETTE.pink, top: PALETTE.violet, phase: 5.6 },
  // achterste laag
  { x: -9, z: -10, width: 5, bottom: PALETTE.violet, top: PALETTE.indigo, phase: 0.7 },
  { x: -3, z: -11, width: 5, bottom: PALETTE.indigo, top: PALETTE.violet, phase: 2.8 },
  { x: 3, z: -10.5, width: 5, bottom: PALETTE.pink, top: PALETTE.indigo, phase: 4.9 },
  { x: 9, z: -11, width: 5, bottom: PALETTE.indigo, top: PALETTE.violet, phase: 6.1 },
];

// Bouwt de droomruimte: achtergrond, fog en lichtgordijnen.
export function createEnvironment(scene) {
  // Achtergrond als TSL-verloop: diep paars onderaan, middernachtzwart bovenaan.
  // screenUV is de positie op het scherm (0..1); y loopt van boven (0) naar onder (1).
  scene.backgroundNode = mix(
    color(PALETTE.midnight),
    color(PALETTE.deepPurple),
    smoothstep(0.25, 1.0, screenUV.y),
  );

  // Zachte fog voor latere (niet-lichtgevende) objecten. De gordijnen doen hun eigen fog.
  scene.fog = new Fog(PALETTE.midnight, 6, 22);

  const curtains = new Group();
  for (const c of CURTAINS) {
    const curtain = createLightCurtain({
      width: c.width,
      colorBottom: c.bottom,
      colorTop: c.top,
      phase: c.phase,
    });
    curtain.position.set(c.x, 3.5, c.z);
    curtain.rotation.y = Math.sin(c.phase) * 0.25; // niet allemaal recht naar de camera
    curtains.add(curtain);
  }
  scene.add(curtains);

  return { curtains };
}
