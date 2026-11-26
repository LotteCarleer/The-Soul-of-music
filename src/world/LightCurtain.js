import { AdditiveBlending, Color, DoubleSide, Mesh, MeshBasicNodeMaterial, PlaneGeometry } from 'three/webgpu';
import {
  cameraPosition,
  distance,
  float,
  mix,
  oneMinus,
  positionLocal,
  positionWorld,
  pow,
  sin,
  smoothstep,
  time,
  uniform,
  uv,
  vec3,
} from 'three/tsl';

// Eén verticaal lichtgordijn, in de stijl van het noorderlicht.
// Het is een plat vlak (PlaneGeometry). De TSL-shader doet het werk:
//   1. positionNode: buigt het vlak traag heen en weer (vertex shader)
//   2. colorNode + opacityNode: maakt zacht licht met strepen dat naar boven vervaagt (fragment shader)
export function createLightCurtain({
  width = 3,
  height = 10,
  colorBottom = '#F05ACF',
  colorTop = '#3210A1',
  phase = 0, // verschuiving in de tijd, zodat niet alle gordijnen gelijk golven
  strength = 1,
  fadeNear = 6, // vanaf deze afstand tot de camera begint het gordijn te vervagen...
  fadeFar = 22, // ...en hier is het helemaal weg (zelfgemaakte fog)
} = {}) {
  // Veel segmenten zodat het vlak vloeiend kan buigen
  const geometry = new PlaneGeometry(width, height, 48, 48);

  const material = new MeshBasicNodeMaterial({
    transparent: true,
    blending: AdditiveBlending, // licht telt op: overlappende gordijnen worden feller
    depthWrite: false,
    side: DoubleSide,
  });
  // Bij additief licht werkt gewone fog niet goed (het licht zou naar de fogkleur
  // optellen). Daarom vervagen we zelf op afstand, zie depthFade hieronder.
  material.fog = false;

  const uColorBottom = uniform(new Color(colorBottom));
  const uColorTop = uniform(new Color(colorTop));
  const p = float(phase);

  // `time` is een TSL-node: seconden sinds de start, automatisch bijgewerkt.
  // Maal 0.35 = alles beweegt traag.
  const slowTime = time.mul(0.35);

  // ── 1. Vertex: het vlak golven ─────────────────────────────────────────────
  // sin() geeft een waarde tussen -1 en 1. Door er de hoogte (y) en de tijd in
  // te steken, krijg je een golf die langzaam over het gordijn loopt.
  const bend = sin(positionLocal.y.mul(0.6).add(slowTime).add(p))
    .mul(0.35)
    .add(sin(positionLocal.x.mul(1.2).add(slowTime.mul(0.7)).add(p)).mul(0.15));
  material.positionNode = vec3(positionLocal.x, positionLocal.y, positionLocal.z.add(bend));

  // ── 2. Fragment: zacht licht ───────────────────────────────────────────────
  // uv() = positie op het vlak, van (0,0) linksonder tot (1,1) rechtsboven.
  const u = uv().x;
  const v = uv().y;

  // Het gordijn zwiert zijwaarts: we verschuiven u met twee golven door elkaar
  const sway = sin(v.mul(3).add(slowTime).add(p))
    .mul(0.08)
    .add(sin(v.mul(7).sub(slowTime.mul(0.6)).add(p.mul(2))).mul(0.03));
  const x = u.add(sway);

  // Zachte linker- en rechterrand
  const edges = smoothstep(0.0, 0.35, x).mul(oneMinus(smoothstep(0.65, 1.0, x)));

  // Fijne verticale strepen, typisch voor noorderlicht
  const rays = sin(x.mul(38).add(slowTime.mul(0.8)).add(p)).mul(0.5).add(0.5);
  const streaks = mix(float(0.55), float(1.0), rays);

  // Onderaan zacht beginnen, naar boven toe uitdoven
  const vertical = smoothstep(0.0, 0.15, v).mul(pow(oneMinus(v), 1.4));

  // Traag ademen in helderheid
  const pulse = sin(time.mul(0.5).add(p)).mul(0.2).add(0.8);

  // Hoe verder van de camera, hoe zwakker (onze eigen fog)
  const depthFade = oneMinus(smoothstep(fadeNear, fadeFar, distance(positionWorld, cameraPosition)));

  material.colorNode = mix(uColorBottom, uColorTop, v);
  // Bij AdditiveBlending bepaalt de opacity hoeveel licht er wordt opgeteld
  material.opacityNode = edges.mul(streaks).mul(vertical).mul(pulse).mul(depthFade).mul(strength);

  return new Mesh(geometry, material);
}
