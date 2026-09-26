// INKWAVE — procedural weapon models held by squidkids.
// Weapon space: grip centre at the origin, +Z = barrel forward, +Y = up, character's right = -X.
// Each weapon: body (vertex-coloured physical plastic with per-vertex surface class aMat — satin, gloss, rubber,
// metal, lens, LED, print), ink (team gloss), optional glow (charger coil) and drum (roller).
//
// Moving parts (character.js drives them from the firing state): def.parts = { name: { geo, pivot, mat, lamp? } } —
// each part's geometry is re-centred on its pivot (the part's Group sits at the pivot and slides / turns / scales
// about it); mat 'body' = shared plastic, 'ink' = team gloss, 'lamp' = a per-instance emissive (makeLampMaterial).
// def.bodyStatic / def.inkStatic = everything that never moves; def.body / def.ink stay the complete merged weapon
// (parts included, at rest) for tools that just want the static model. Parts per weapon:
//   shooter  trigger · bolt (cocking knob, cycles per shot) · can (ink canister, pulses per shot) · led (status lamp)
//   blaster  trigger · pump (foregrip slide — the left hand rides it) · needle (pressure gauge) · bulb (ink bulb)
//   charger  trigger · bolt (charging handle, draws back with the charge) · lens / eyepiece (scope glow) · ports
//            (muzzle-brake heat) · glow = coil rings with a per-vertex aSeg threshold (makeCoilMaterial lights them in order)
//   roller   led (reservoir lamp) · drum (spins; character.js gives it inertia)
//
// Hands: the squidkid fist is modelled around a Ø 2.8 cm handle whose axis passes through HAND.hole (character-geo).
// A grip spec { pos, handZ, handY } says where that handle axis passes (pos), which way it runs toward the thumb
// (handZ) and which way the wrist lies (handY). Handles held by a hand are ≤ 1.5 cm in radius around that axis.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { superEllipsoid, lathe, smoothProfile, sweep, finalize, torus as torusG, HAND } from './character-geo.js';
import { WMAT } from './character-mats.js';

const V3 = THREE.Vector3;
const M = WMAT;
const C = {
  cream: '#f2ede1', white: '#eef0f3', bone: '#e4ddcc', dark: '#2a2e37', darker: '#1b1e25', gray: '#8f98a6', metal: '#c3c9d2',
  gunmetal: '#5b616c', rubber: '#26282e', lens: '#0b0f16', red: '#ff3b30', green: '#3dff7a', amber: '#ffb000', decal: '#f7f7f5', hazard: '#ffcf33',
};

class Parts {
  constructor() { this.list = []; }
  add(geo, color, mat = M.satin) {
    const g = geo.index ? geo : finalize(geo);
    const n = g.attributes.position.count; const col = new Float32Array(n * 3); const c = new THREE.Color(color);
    for (let i = 0; i < n; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
    const out = new THREE.BufferGeometry();
    out.setAttribute('position', g.attributes.position.clone());
    out.setAttribute('normal', g.attributes.normal.clone());
    out.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    out.setAttribute('aMat', new THREE.Float32BufferAttribute(new Float32Array(n).fill(mat), 1));
    out.setIndex(g.index.clone());
    this.list.push(out); return this;
  }
  build() { return this.list.length ? mergeGeometries(this.list, false) : null; }
}

// ---------------------------------------------------------------------------------------------- helpers
/** Lathe along +Z from [r, z] profile. */
function latheZ(profile, seg = 16) { const g = lathe(profile, seg); g.rotateX(Math.PI / 2); return g; }
function torus(R, r, rs = 6, ts = 16, arc = Math.PI * 2) { return torusG(R, r, rs, ts, arc); }
function at(g, x, y, z) { g.translate(x, y, z); return g; }
/** Rounded box (w, h, d = full sizes), squareness e (smaller = boxier). */
function rbox(w, h, d, e = 0.3, ws = 12, hs = 8, deform) { return superEllipsoid(w / 2, h / 2, d / 2, e, e, ws, hs, deform); }
/** Orient geometry authored along +Y so that +Y → dir, then place at p. */
function orient(g, dir, p) { g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new V3(0, 1, 0), dir.clone().normalize())); return at(g, p.x, p.y, p.z); }
/** Small screw head (dome with a slot) facing n at p. */
function screw(P, p, n, r = 0.0032, col = C.metal) {
  const h = lathe([[0, 0], [r, 0], [r, 0.0006], [r * 0.72, 0.0014], [0, 0.0017]], 6);
  P.add(orient(h, n, p), col, M.metal);
}
/** Thin extruded decal from a 2D shape (in the XY plane), placed with basis (x, y) at p. */
function decal(shape, depth = 0.0006) {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 5 });
  return finalize(g);
}
function placeXY(g, xAxis, yAxis, p) {
  const x = xAxis.clone().normalize(), y = yAxis.clone().addScaledVector(x, -yAxis.dot(x)).normalize(), z = new V3().crossVectors(x, y);
  g.applyMatrix4(new THREE.Matrix4().makeBasis(x, y, z).setPosition(p));
  return g;
}
/** Squid glyph (mantle arrow + head + eyes cut out) as a Shape of height ~1 (scale it). */
function squidShape(s = 1) {
  const sh = new THREE.Shape();
  sh.moveTo(0, 0.62 * s); sh.lineTo(0.42 * s, 0.1 * s); sh.quadraticCurveTo(0.38 * s, -0.08 * s, 0.26 * s, -0.12 * s);
  sh.lineTo(0.26 * s, -0.42 * s); sh.lineTo(0.14 * s, -0.42 * s); sh.lineTo(0.12 * s, -0.2 * s);
  sh.lineTo(0.05 * s, -0.2 * s); sh.lineTo(0.05 * s, -0.46 * s); sh.lineTo(-0.05 * s, -0.46 * s); sh.lineTo(-0.05 * s, -0.2 * s);
  sh.lineTo(-0.12 * s, -0.2 * s); sh.lineTo(-0.14 * s, -0.42 * s); sh.lineTo(-0.26 * s, -0.42 * s); sh.lineTo(-0.26 * s, -0.12 * s);
  sh.quadraticCurveTo(-0.38 * s, -0.08 * s, -0.42 * s, 0.1 * s); sh.lineTo(0, 0.62 * s);
  for (const ex of [0.12, -0.12]) { const e = new THREE.Path(); e.absellipse(ex * s, 0.02 * s, 0.055 * s, 0.07 * s, 0, Math.PI * 2, false); sh.holes.push(e); }
  return sh;
}
/** An animated sub-part built from its own Parts, authored in weapon space; re-centred on `pivot` in getWeaponDef. */
function part(P, pivot, mat = 'body', lamp = null) { return { src: P.build(), pivot: pivot.clone(), mat, lamp }; }

/** Per-instance glowing material for lamp parts (LEDs, scope lenses, hot muzzle ports). */
export function makeLampMaterial(spec = {}) {
  const m = new THREE.MeshStandardMaterial({ color: spec.color ?? 0x222222, emissive: spec.emissive ?? spec.color ?? 0xffffff, emissiveIntensity: spec.intensity ?? 1, roughness: spec.roughness ?? 0.25, metalness: 0 });
  m.name = 'iw-lamp';
  return m;
}

/** Charger coil: the rings light one after another as the charge passes their aSeg threshold (rear → muzzle), the ring
 *  being filled flickers hot, full charge ripples along the coil, the release flashes white. userData.u = uniforms
 *  { uCharge, uFull, uFlash, uTime }; emissive = team colour. */
export function makeCoilMaterial() {
  const m = new THREE.MeshStandardMaterial({ color: 0x1b1c22, emissive: 0xffffff, emissiveIntensity: 1, roughness: 0.3, metalness: 0.25 });
  const U = { uCharge: { value: 0 }, uFull: { value: 0 }, uFlash: { value: 0 }, uTime: { value: 0 } };
  m.userData.u = U;
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float aSeg;\nvarying float vSeg;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvSeg = aSeg;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uCharge, uFull, uFlash, uTime;\nvarying float vSeg;')
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        {
          float lit = smoothstep(vSeg - 0.1, vSeg + 0.01, uCharge);
          float edge = exp(-pow((uCharge - vSeg + 0.05) * 11.0, 2.0)) * (1.0 - uFull);
          float I = 0.05 + lit * (0.9 + 1.7 * uCharge) + edge * (1.3 + 0.9 * sin(uTime * 57.0))
                  + uFull * (1.1 + 1.0 * (0.5 + 0.5 * sin(uTime * 34.0 - vSeg * 14.0))) + uFlash * 6.0;
          totalEmissiveRadiance = emissive * I + vec3(uFlash * 2.0);
        }`);
  };
  m.customProgramCacheKey = () => 'iw-coil-1';
  return m;
}

function chevronShape(w, h, n = 3, gap = 0.4) {
  const sh = []; const step = w / n;
  for (let i = 0; i < n; i++) {
    const s = new THREE.Shape(); const x0 = i * step, t = step * (1 - gap);
    s.moveTo(x0, 0); s.lineTo(x0 + t, 0); s.lineTo(x0 + t + h * 0.5, h * 0.5); s.lineTo(x0 + t, h); s.lineTo(x0, h); s.lineTo(x0 + h * 0.5, h * 0.5); s.lineTo(x0, 0);
    sh.push(s);
  }
  return sh;
}

// ---------------------------------------------------------------------------------------------- hands
/** Grip-hole axis point relative to the hand bone (right hand = mirror of the modelled left hand). */
export const GRIP_HOLE_L = HAND.hole.clone();
export const GRIP_HOLE_R = new V3(-HAND.hole.x, HAND.hole.y, HAND.hole.z);
/** Twirl pivot: the right fist's grip axis (so spins happen around the handle the kid is holding). */
export const FIST_OFFSET = GRIP_HOLE_R.clone();

/** Pistol grip around the handle axis A through the origin: rubber-paneled, finger-grooved front strap,
 *  beavertail over the web of the hand, trigger + guard for the index finger, flared base plate. */
const GRIP_AXIS = new V3(0, 1, 0.25).normalize();
function pistolGrip(P, opt = {}) {
  const A = GRIP_AXIS;
  const tilt = Math.atan2(A.z, A.y);
  // core: slim oval handle, finger grooves on the front strap
  const core = superEllipsoid(0.0118, 0.056, 0.0152, 0.62, 0.7, 12, 12, (q) => {
    if (q.z > 0) { const f = 0.5 + 0.5 * Math.cos(((q.y + 0.0006) / 0.0122) * Math.PI * 2); q.z -= 0.0016 * f * (1 - Math.abs(q.x) / 0.0118) * (q.y < 0.03 ? 1 : 0); }
    if (q.y < -0.046) { q.x *= 1.08; q.z *= 1.06; }
  });
  core.rotateX(tilt); P.add(at(core, 0, -0.008, -0.002), C.darker, M.satin);
  // rubber side panels (knurled)
  for (const sx of [1, -1]) {
    const pn = superEllipsoid(0.003, 0.038, 0.0118, 0.5, 0.55, 5, 8);
    pn.rotateX(tilt); P.add(at(pn, sx * 0.0104, -0.012, -0.004), C.rubber, M.rubber);
  }
  // beavertail + back strap
  const bt = superEllipsoid(0.0118, 0.012, 0.016, 0.5, 0.6, 8, 5, (q) => { if (q.z < 0) q.y -= 0.006 * (q.z / 0.016) ** 2; });
  bt.rotateX(tilt - 0.35); P.add(at(bt, 0, 0.042, -0.018), C.darker, M.satin);
  // base plate (flared magazine foot)
  const base = superEllipsoid(0.0138, 0.0048, 0.0188, 0.45, 0.5, 10, 4);
  base.rotateX(tilt); P.add(at(base, 0, -0.062, -0.018), opt.baseCol || C.dark, M.gloss);
  // trigger guard (loop in front of the index finger) + trigger blade
  const g0 = new V3(0, 0.03, 0.012), g1 = new V3(0, 0.018, 0.043), g2 = new V3(0, 0.002, 0.05), g3 = new V3(0, -0.006, 0.028);
  const guard = sweep([g0, g1, g2, g3], { seg: 8, radial: 5, capSteps: 2, radius: () => 0.0032, flat: 1.9, outward: (Pp, o) => o.set(1, 0, 0) });
  P.add(guard.geo, C.dark, M.satin);
  const trig = superEllipsoid(0.0034, 0.0105, 0.0034, 0.7, 0.7, 6, 6, (q) => { q.z += 16 * q.y * q.y; });
  trig.rotateX(-0.25); (opt.T || P).add(at(trig, 0, 0.0215, 0.0305), C.metal, M.metal);
}
const GRIP_PISTOL = { pos: new V3(0, 0, 0), handZ: GRIP_AXIS.clone(), handY: new V3(0, 0.25, -1) };
/** Trigger blade hinge (top of the blade, inside the frame): the trigger part squeezes back about +X here. */
const TRIGGER_PIVOT = new V3(0, 0.0315, 0.0282);

// ---------------------------------------------------------------------------------------------- shooter
function buildShooter() {
  const P = new Parts(), I = new Parts(), T = new Parts(), BOLT = new Parts(), CAN = new Parts(), LED = new Parts();
  pistolGrip(P, { T });
  // receiver: cream shell, dark lower frame, team-ink spine
  const recv = superEllipsoid(0.0265, 0.034, 0.1, 0.42, 0.56, 14, 10, (q) => {
    if (q.z > 0.045) q.y *= 1 - 0.3 * (q.z - 0.045) / 0.055;          // taper to the nose
    if (q.y > 0) q.x *= 1 - 0.12 * (q.y / 0.034);                       // tumblehome
  });
  P.add(at(recv, 0, 0.068, 0.028), C.cream, M.satin);
  const frame = superEllipsoid(0.0232, 0.012, 0.094, 0.4, 0.5, 12, 6);
  P.add(at(frame, 0, 0.041, 0.03), C.dark, M.satin);
  const spine = superEllipsoid(0.0165, 0.0065, 0.086, 0.5, 0.6, 12, 5);
  I.add(at(spine, 0, 0.1005, 0.02));
  // panel seams + screws on both flanks, squid decal + chevrons on the left flank
  for (const sx of [1, -1]) {
    const seam = superEllipsoid(0.0006, 0.0205, 0.0006, 1, 1, 4, 6); P.add(at(seam, sx * 0.0262, 0.069, 0.052), C.darker, M.print);
    const seam2 = superEllipsoid(0.0006, 0.0006, 0.054, 1, 1, 4, 6); P.add(at(seam2, sx * 0.0258, 0.056, 0.016), C.darker, M.print);
    for (const [y, z] of [[0.078, -0.052], [0.078, 0.036], [0.05, 0.094]]) screw(P, new V3(sx * 0.026, y, z), new V3(sx, 0, 0), 0.0028);
  }
  const sq = decal(squidShape(0.028)); placeXY(sq, new V3(0, 0, -1), new V3(0, 1, 0), new V3(0.0272, 0.074, -0.012)); P.add(sq, C.decal, M.print);
  for (const s of chevronShape(0.03, 0.009, 3, 0.45)) { const g = decal(s); placeXY(g, new V3(0, 0, 1), new V3(0, 1, 0), new V3(0.0268, 0.052, 0.036)); I.add(g); }
  // nozzle assembly: turned barrel, vented shroud, team ring, flared tip
  const barrel = latheZ(smoothProfile([[0.0, 0.1], [0.0138, 0.1], [0.0138, 0.118], [0.0156, 0.121], [0.0156, 0.162], [0.0138, 0.166], [0.0125, 0.17], [0.0125, 0.184]], 10).concat([[0.0152, 0.187], [0.019, 0.199], [0.0198, 0.207], [0.0186, 0.2118], [0.0128, 0.2122], [0.0098, 0.207], [0.0082, 0.196], [0.0, 0.194]]), 12);
  P.add(at(barrel, 0, 0.066, 0), C.gunmetal, M.metal);
  for (let k = 0; k < 3; k++) { const v = torus(0.0158, 0.0013, 3, 12); P.add(at(v, 0, 0.066, 0.127 + k * 0.012), C.darker, M.satin); }
  const nr = torus(0.0145, 0.0034, 4, 14); I.add(at(nr, 0, 0.066, 0.176));
  // ink canister on top: team ink visible between cage bars, caps + valve
  const can = latheZ(smoothProfile([[0.0, -0.052], [0.0178, -0.05], [0.0184, -0.04], [0.0184, 0.04], [0.0178, 0.05], [0.0, 0.052]], 7), 12);
  CAN.add(at(can, 0, 0.123, 0.018));
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
    const bar = superEllipsoid(0.0026, 0.0026, 0.044, 0.6, 0.6, 4, 4);
    P.add(at(bar, Math.cos(a) * 0.0196, 0.123 + Math.sin(a) * 0.0196, 0.018), C.dark, M.satin);
  }
  for (const [z, s] of [[-0.036, -1], [0.072, 1]]) {
    const cap = latheZ([[0, -0.009 * s], [0.0206, -0.009 * s], [0.0218, -0.004 * s], [0.0218, 0.006 * s], [0.018, 0.0095 * s], [0, 0.01 * s]], 12);
    P.add(at(cap, 0, 0.123, z), C.dark, M.gloss);
  }
  const valve = lathe([[0, 0], [0.0052, 0], [0.0052, 0.006], [0.0078, 0.0075], [0.0078, 0.011], [0, 0.0115]], 8);
  P.add(at(valve, 0, 0.143, -0.028), C.metal, M.metal);
  const mount = superEllipsoid(0.0118, 0.012, 0.05, 0.5, 0.6, 8, 5); P.add(at(mount, 0, 0.105, 0.018), C.dark, M.satin);
  // sights + status LED
  const rear = superEllipsoid(0.0105, 0.0065, 0.0052, 0.4, 0.4, 6, 4, (q) => { if (q.y > 0.002 && Math.abs(q.x) < 0.003) q.y = 0.002; });
  P.add(at(rear, 0, 0.148, -0.03), C.darker, M.satin);
  const front = superEllipsoid(0.0022, 0.0078, 0.004, 0.6, 0.6, 5, 4); P.add(at(front, 0, 0.1485, 0.068), C.darker, M.satin);
  const led = superEllipsoid(0.0032, 0.0032, 0.0016, 1, 1, 8, 4); LED.add(orient(led, new V3(-1, 0, 0), new V3(-0.0268, 0.084, -0.046)), C.green, M.led);
  const ledBezel = torus(0.0036, 0.0009, 3, 10); P.add(orient(ledBezel.rotateX(Math.PI / 2), new V3(-1, 0, 0), new V3(-0.0266, 0.084, -0.046)), C.darker, M.satin);
  // rear cap + cocking knob
  const back = superEllipsoid(0.0232, 0.028, 0.0095, 0.45, 0.55, 10, 6); P.add(at(back, 0, 0.068, -0.075), C.dark, M.gloss);
  const knob = latheZ([[0, -0.0145], [0.0068, -0.0145], [0.0074, -0.01], [0.0074, 0.0], [0, 0.0]], 10); BOLT.add(at(knob, 0, 0.068, -0.078), C.metal, M.metal);
  for (let k = 0; k < 3; k++) BOLT.add(at(torus(0.0075, 0.0007, 3, 10), 0, 0.068, -0.0905 + k * 0.0035), C.gunmetal, M.metal);   // knurl rings
  const guide = latheZ([[0.0, -0.0835], [0.0086, -0.0835], [0.0092, -0.081], [0.0, -0.0805]], 12); P.add(at(guide, 0, 0.068, 0), C.darker, M.gloss);   // bolt guide collar
  // support foregrip for the left hand (vertical, under the nose)
  const fg = superEllipsoid(0.0118, 0.028, 0.0132, 0.55, 0.65, 10, 8, (q) => { if (q.z > 0) { const f = 0.5 + 0.5 * Math.cos((q.y / 0.0125) * Math.PI * 2); q.z -= 0.0012 * f; } });
  fg.rotateX(-0.12); P.add(at(fg, 0, 0.016, 0.07), C.darker, M.satin);
  const fgr = superEllipsoid(0.0124, 0.0175, 0.0095, 0.5, 0.55, 8, 6); fgr.rotateX(-0.12); P.add(at(fgr, 0, 0.012, 0.069), C.rubber, M.rubber);
  const fgCap = superEllipsoid(0.0134, 0.0042, 0.0152, 0.5, 0.5, 10, 4); P.add(at(fgCap, 0, -0.0125, 0.074), C.dark, M.gloss);
  return {
    kind: 'shooter', body: P.build(), ink: I.build(),
    parts: {
      trigger: part(T, TRIGGER_PIVOT),
      bolt: part(BOLT, new V3(0, 0.068, -0.078)),
      can: part(CAN, new V3(0, 0.123, 0.018), 'ink'),
      led: part(LED, new V3(-0.0268, 0.084, -0.046), 'lamp', { color: '#0f2a18', emissive: '#3dff7a', intensity: 1.3 }),
    },
    muzzle: new V3(0, 0.066, 0.212),
    gripR: GRIP_PISTOL,
    gripL: { pos: new V3(0, 0.02, 0.0705), handZ: new V3(0, 1, -0.12), handY: new V3(0.45, -0.05, -1) },
    twirl: new V3(0, 0.03, 0.03),
  };
}

// ---------------------------------------------------------------------------------------------- roller
function buildRoller() {
  const P = new Parts(), I = new Parts(), LED = new Parts();
  const L = 0.84; // grip -> drum axis
  // shaft: brushed tube, ferrules, two knurled rubber grips (top = right hand, mid = left hand)
  P.add(latheZ([[0, -0.072], [0.0098, -0.072], [0.0098, 0.715], [0, 0.715]], 10), C.metal, M.metal);
  const topGrip = latheZ(smoothProfile([[0, -0.094], [0.0112, -0.094], [0.0148, -0.086], [0.0142, -0.07], [0.0136, -0.03], [0.0138, 0.02], [0.0142, 0.052], [0.0158, 0.06], [0.0118, 0.066]], 10), 12);
  P.add(topGrip, C.rubber, M.rubber);
  const cap = latheZ([[0, -0.1], [0.0118, -0.0985], [0.0142, -0.094], [0, -0.094]], 12); P.add(cap, C.dark, M.gloss);
  I.add(at(torus(0.0142, 0.0028, 5, 14), 0, 0, 0.066));
  const midGrip = latheZ(smoothProfile([[0.0098, 0.13], [0.0136, 0.136], [0.0142, 0.15], [0.0138, 0.2], [0.0142, 0.235], [0.0136, 0.25], [0.0098, 0.256]], 8), 10);
  P.add(midGrip, C.rubber, M.rubber);
  for (const z of [0.128, 0.258]) I.add(at(torus(0.0118, 0.0022, 4, 12), 0, 0, z));
  // hazard band + squid decal wrapped on the shaft
  for (let k = 0; k < 5; k++) { const band = latheZ([[0.0101, 0], [0.0101, 0.008]], 8); P.add(at(band, 0, 0, 0.34 + k * 0.016), k % 2 ? C.dark : C.hazard, M.print); }
  // yoke: cast hub, twin swept arms, bearing bosses with bolt circles, ink reservoir with a window
  const hub = superEllipsoid(0.026, 0.024, 0.036, 0.5, 0.6, 12, 8); P.add(at(hub, 0, 0, 0.716), C.dark, M.satin);
  const collar = latheZ([[0.0098, 0.69], [0.0162, 0.692], [0.0168, 0.702], [0.0098, 0.704]], 12); P.add(collar, C.metal, M.metal);
  for (const sx of [1, -1]) {
    const arm = sweep([new V3(0, 0, 0.712), new V3(0.13 * sx, -0.004, 0.734), new V3(0.285 * sx, -0.012, 0.768), new V3(0.328 * sx, -0.02, 0.808), new V3(0.334 * sx, -0.022, L)], {
      seg: 12, radial: 7, capSteps: 2, radius: (t) => 0.0122 - 0.002 * t, flat: 0.62, outward: (Pp, o) => o.set(0, 1, 0),
    });
    P.add(arm.geo, C.gunmetal, M.metal);
    const boss = latheZ([[0, -0.014], [0.0262, -0.014], [0.0282, -0.01], [0.0284, 0.008], [0.025, 0.013], [0, 0.013]], 12);
    boss.rotateY(Math.PI / 2); P.add(at(boss, 0.322 * sx, -0.022, L), C.dark, M.gloss);
    for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; screw(P, new V3(0.3355 * sx, -0.022 + Math.cos(a) * 0.017, L + Math.sin(a) * 0.017), new V3(sx, 0, 0), 0.0024); }
  }
  const res = superEllipsoid(0.056, 0.026, 0.036, 0.55, 0.6, 12, 7); I.add(at(res, 0, 0.03, 0.738));
  const resFrame = superEllipsoid(0.06, 0.009, 0.04, 0.4, 0.5, 14, 4); P.add(at(resFrame, 0, 0.052, 0.738), C.dark, M.gloss);
  const resBase = superEllipsoid(0.06, 0.008, 0.04, 0.4, 0.5, 14, 4); P.add(at(resBase, 0, 0.008, 0.738), C.dark, M.satin);
  for (const sx of [1, -1]) for (const sz of [1, -1]) { const post = superEllipsoid(0.004, 0.02, 0.004, 0.7, 0.7, 5, 5); P.add(at(post, sx * 0.05, 0.03, 0.738 + sz * 0.028), C.dark, M.satin); }
  const vcap = lathe([[0, 0], [0.009, 0], [0.0098, 0.004], [0.0082, 0.0085], [0, 0.009]], 10); P.add(at(vcap, 0.028, 0.06, 0.738), C.metal, M.metal);
  const led = superEllipsoid(0.0036, 0.0022, 0.0036, 1, 1, 8, 4); LED.add(at(led, -0.03, 0.062, 0.738), C.amber, M.led);
  const sq = decal(squidShape(0.032)); placeXY(sq, new V3(1, 0, 0), new V3(0, 0.3, -1), new V3(0, 0.0605, 0.738)); P.add(sq, C.decal, M.print);
  // drum (separate spinning mesh): axis along X, centred at origin; lumpy wet ink with raised tread ribs
  const drumProf = smoothProfile([[0.0, -0.3], [0.07, -0.3], [0.09, -0.296], [0.099, -0.283], [0.1015, -0.25], [0.1015, 0.25], [0.099, 0.283], [0.09, 0.296], [0.07, 0.3], [0.0, 0.3]], 16);
  const drum = lathe(drumProf, 26, (v) => {
    const a = Math.atan2(v.z, v.x); const rr = Math.hypot(v.x, v.z);
    if (rr > 0.085) {
      let k = 1 + 0.03 * Math.sin(a * 7 + v.y * 21) * Math.sin(a * 3 - v.y * 13);
      k += 0.018 * Math.max(0, Math.cos(v.y * 42)) * (Math.abs(v.y) < 0.26 ? 1 : 0);   // tread ribs
      v.x *= k; v.z *= k;
    }
  });
  drum.rotateZ(Math.PI / 2);
  const caps = new Parts();
  for (const sx of [1, -1]) {
    const c = latheZ([[0, -0.007], [0.074, -0.007], [0.081, -0.002], [0.081, 0.003], [0.064, 0.008], [0.03, 0.009], [0.018, 0.013], [0, 0.013]], 16);
    c.rotateY(sx * Math.PI / 2); caps.add(at(c, 0.302 * sx, 0, 0), C.dark, M.gloss);
    for (let k = 0; k < 4; k++) { const a = (k / 4) * Math.PI * 2 + 0.4; const b = lathe([[0, 0], [0.0042, 0], [0.0042, 0.002], [0, 0.0028]], 5); caps.add(orient(b, new V3(sx, 0, 0), new V3(0.3085 * sx + 0.002 * sx, Math.cos(a) * 0.05, Math.sin(a) * 0.05)), C.metal, M.metal); }
    const hubC = latheZ([[0, 0], [0.016, 0], [0.018, 0.006], [0.012, 0.012], [0, 0.013]], 10); hubC.rotateY(sx * Math.PI / 2); caps.add(at(hubC, 0.309 * sx, 0, 0), C.metal, M.metal);
  }
  return {
    kind: 'roller', body: P.build(), ink: I.build(), drum, drumCaps: caps.build(), drumAt: new V3(0, -0.022, L), drumR: 0.1,
    parts: { led: part(LED, new V3(-0.03, 0.062, 0.738), 'lamp', { color: '#3a2600', emissive: '#ffb000', intensity: 0.6 }) },
    muzzle: new V3(0, -0.022, L),
    gripR: { pos: new V3(0, 0, -0.022), handZ: new V3(0, 0, 1), handY: new V3(-0.3, 1, 0) },
    gripL: { pos: new V3(0, 0, 0.19), handZ: new V3(0, 0, 1), handY: new V3(0.5, 1, 0) },
    twirl: new V3(0, 0, 0),
  };
}

// ---------------------------------------------------------------------------------------------- charger
function buildCharger() {
  const P = new Parts(), I = new Parts(), G = new Parts(), T = new Parts(), BOLT = new Parts(), LENS = new Parts(), EYE = new Parts(), PORTS = new Parts();
  pistolGrip(P, { T });
  // receiver: long white body with a team-ink spine and dark rails
  const rec = superEllipsoid(0.0255, 0.038, 0.13, 0.4, 0.56, 14, 10, (q) => { if (q.z > 0.07) q.y *= 1 - 0.3 * (q.z - 0.07) / 0.06; if (q.y > 0) q.x *= 1 - 0.1 * q.y / 0.038; });
  P.add(at(rec, 0, 0.062, 0.035), C.white, M.satin);
  const recLow = superEllipsoid(0.0225, 0.011, 0.12, 0.4, 0.5, 12, 5); P.add(at(recLow, 0, 0.034, 0.04), C.dark, M.satin);
  const spine = superEllipsoid(0.0155, 0.0058, 0.11, 0.5, 0.6, 12, 5); I.add(at(spine, 0, 0.0975, 0.03));
  for (const sx of [1, -1]) {
    for (const [y, z] of [[0.07, -0.065], [0.07, 0.03], [0.07, 0.125]]) screw(P, new V3(sx * 0.0252, y, z), new V3(sx, 0, 0), 0.0026);
    const seam = superEllipsoid(0.0006, 0.0006, 0.095, 1, 1, 4, 6); P.add(at(seam, sx * 0.0248, 0.05, 0.035), C.darker, M.print);
  }
  const sq = decal(squidShape(0.026)); placeXY(sq, new V3(0, 0, -1), new V3(0, 1, 0), new V3(0.026, 0.066, -0.02)); P.add(sq, C.decal, M.print);
  // charging handle on the outer (right) flank: a machined slot with a T-knob that draws back as the charge builds
  const slot = superEllipsoid(0.0014, 0.0034, 0.0215, 0.5, 0.5, 6, 6); P.add(at(slot, -0.0252, 0.079, -0.0255), C.darker, M.satin);
  const slotRim = superEllipsoid(0.0009, 0.0048, 0.0235, 0.4, 0.5, 6, 6); P.add(at(slotRim, -0.0247, 0.079, -0.0255), C.gunmetal, M.metal);
  const stem = latheZ([[0, 0], [0.0024, 0], [0.0024, 0.011], [0, 0.011]], 8); stem.rotateY(-Math.PI / 2); BOLT.add(at(stem, -0.0245, 0.079, -0.008), C.metal, M.metal);
  const cap = superEllipsoid(0.0034, 0.0052, 0.0052, 0.6, 0.7, 8, 6); BOLT.add(at(cap, -0.0372, 0.079, -0.008), C.dark, M.gloss);
  const capRing = torus(0.0046, 0.0008, 3, 12); capRing.rotateY(Math.PI / 2); BOLT.add(at(capRing, -0.0358, 0.079, -0.008), C.metal, M.metal);
  // skeletal stock + rubber butt pad + cheek rest
  const stockTop = superEllipsoid(0.0115, 0.009, 0.088, 0.5, 0.6, 8, 5); stockTop.rotateX(0.04); P.add(at(stockTop, 0, 0.066, -0.17), C.dark, M.satin);
  const stockLow = sweep([new V3(0, 0.03, -0.09), new V3(0, 0.012, -0.16), new V3(0, 0.004, -0.228), new V3(0, 0.012, -0.252)], { seg: 8, radial: 6, capSteps: 2, radius: () => 0.0072, flat: 1.6, outward: (Pp, o) => o.set(1, 0, 0) });
  P.add(stockLow.geo, C.dark, M.satin);
  const cheek = superEllipsoid(0.0128, 0.006, 0.04, 0.5, 0.6, 8, 4); P.add(at(cheek, 0, 0.078, -0.16), C.rubber, M.rubber);
  const pad = superEllipsoid(0.0138, 0.042, 0.0078, 0.45, 0.55, 8, 8); pad.rotateX(0.08); P.add(at(pad, 0, 0.038, -0.262), C.rubber, M.rubber);
  // long barrel: fluted sleeve, charge coil (glow), muzzle brake with ports
  const barrel = latheZ(smoothProfile([[0, 0.14], [0.0122, 0.14], [0.0122, 0.61], [0.0128, 0.622]], 6).concat([[0.0178, 0.626], [0.0182, 0.672], [0.0165, 0.684], [0.0096, 0.684], [0.0, 0.68]]), 10);
  P.add(at(barrel, 0, 0.058, 0), C.gunmetal, M.metal);
  for (let k = 0; k < 2; k++) { const port = superEllipsoid(0.0186, 0.0026, 0.004, 0.6, 0.6, 8, 4); PORTS.add(at(port, 0, 0.058, 0.642 + k * 0.016), C.darker, M.satin); }
  const guard = superEllipsoid(0.0232, 0.026, 0.1, 0.42, 0.56, 12, 8, (q) => { if (q.y < 0) q.x *= 0.92; });
  P.add(at(guard, 0, 0.046, 0.23), C.white, M.satin);
  for (let k = 0; k < 3; k++) { const vent = superEllipsoid(0.0236, 0.0028, 0.012, 0.6, 0.6, 8, 4); P.add(at(vent, 0, 0.056, 0.196 + k * 0.026), C.darker, M.satin); }
  for (let i = 0; i < 4; i++) { const c = torus(0.0232, 0.0056, 5, 14); G.add(at(c, 0, 0.058, 0.365 + i * 0.047), '#ffffff'); }
  const coilCore = latheZ([[0.0168, 0.343], [0.0178, 0.35], [0.0178, 0.522], [0.0168, 0.53]], 12); P.add(at(coilCore, 0, 0.058, 0), C.darker, M.metal);
  for (const z of [0.34, 0.534]) { const r = latheZ([[0.0122, z - 0.006], [0.028, z - 0.005], [0.029, z], [0.028, z + 0.005], [0.0122, z + 0.006]], 12); P.add(at(r, 0, 0.058, 0), C.dark, M.gloss); }
  // underslung handguard for the left hand (horizontal grip)
  const hg = latheZ(smoothProfile([[0.0, 0.176], [0.0112, 0.178], [0.0132, 0.186], [0.0134, 0.236], [0.0128, 0.252], [0.0, 0.256]], 8), 12);
  P.add(at(hg, 0, 0.004, 0), C.rubber, M.rubber);
  const hgMount = superEllipsoid(0.008, 0.012, 0.03, 0.5, 0.6, 6, 5); P.add(at(hgMount, 0, 0.018, 0.216), C.dark, M.satin);
  // scope: tube, turrets, lens + sunshade, mounts
  const scope = latheZ(smoothProfile([[0, -0.052], [0.0182, -0.051], [0.0196, -0.038], [0.0162, -0.022], [0.0162, 0.104], [0.021, 0.124], [0.0225, 0.158], [0.0205, 0.162], [0.0, 0.16]], 9), 14);
  P.add(at(scope, 0, 0.122, 0), C.dark, M.satin);
  const lens = superEllipsoid(0.0192, 0.0192, 0.003, 1, 1, 12, 4); LENS.add(at(lens, 0, 0.122, 0.1605), C.lens, M.lens);
  const lensB = superEllipsoid(0.0158, 0.0158, 0.0024, 1, 1, 10, 4); EYE.add(at(lensB, 0, 0.122, -0.0525), C.lens, M.lens);
  const reticle = superEllipsoid(0.0142, 0.0004, 0.0003, 1, 1, 6, 4); P.add(at(reticle.clone(), 0, 0.122, 0.1638), C.darker, M.print);
  P.add(at(reticle.rotateZ(Math.PI / 2), 0, 0.122, 0.1638), C.darker, M.print);   // crosshair etched on the objective
  I.add(at(torus(0.0212, 0.0022, 3, 14), 0, 0.122, 0.157));
  for (const [dir, p] of [[new V3(0, 1, 0), new V3(0, 0.1375, 0.04)], [new V3(1, 0, 0), new V3(0.0155, 0.122, 0.04)]]) {
    const t = lathe([[0, 0], [0.0074, 0], [0.0076, 0.006], [0.0066, 0.0085], [0, 0.009]], 10); P.add(orient(t, dir, p), C.metal, M.metal);
  }
  for (const z of [-0.005, 0.085]) { const m = superEllipsoid(0.0092, 0.0162, 0.0105, 0.5, 0.6, 6, 5); P.add(at(m, 0, 0.102, z), C.dark, M.satin); }
  // visible ink cartridge under the receiver (windowed)
  const can = superEllipsoid(0.0158, 0.0158, 0.036, 1, 1, 10, 7); I.add(at(can, 0, 0.012, 0.118));
  for (let k = 0; k < 3; k++) { const a = (k / 3) * Math.PI * 2 + 0.5; const bar = superEllipsoid(0.0024, 0.0024, 0.032, 0.6, 0.6, 4, 4); P.add(at(bar, Math.cos(a) * 0.0172, 0.012 + Math.sin(a) * 0.0172, 0.118), C.dark, M.satin); }
  for (const z of [0.082, 0.154]) { const c = latheZ([[0, z - 0.004], [0.0182, z - 0.004], [0.0186, z + 0.004], [0, z + 0.004]], 12); P.add(at(c, 0, 0.012, 0), C.dark, M.gloss); }
  // coil rings light in order (rear → muzzle): per-vertex aSeg threshold for makeCoilMaterial
  const glow = G.build();
  {
    const pz = glow.attributes.position, seg = new Float32Array(pz.count), TH = [0.22, 0.47, 0.72, 0.96];
    for (let i = 0; i < pz.count; i++) seg[i] = TH[Math.max(0, Math.min(3, Math.round((pz.getZ(i) - 0.365) / 0.047)))];
    glow.setAttribute('aSeg', new THREE.Float32BufferAttribute(seg, 1));
  }
  return {
    kind: 'charger', body: P.build(), ink: I.build(), glow,
    parts: {
      trigger: part(T, TRIGGER_PIVOT),
      bolt: part(BOLT, new V3(-0.0245, 0.079, -0.008)),
      lens: part(LENS, new V3(0, 0.122, 0.1605), 'lamp', { color: '#0b0f16', emissive: '#ffffff', intensity: 0.2, roughness: 0.06 }),
      eyepiece: part(EYE, new V3(0, 0.122, -0.0525), 'lamp', { color: '#0b0f16', emissive: '#ffffff', intensity: 0.05, roughness: 0.06 }),
      ports: part(PORTS, new V3(0, 0.058, 0.65), 'lamp', { color: '#1b1e25', emissive: '#ffffff', intensity: 0, roughness: 0.5 }),
    },
    muzzle: new V3(0, 0.058, 0.686),
    gripR: GRIP_PISTOL,
    gripL: { pos: new V3(0, 0.004, 0.214), handZ: new V3(0, 0, 1), handY: new V3(0.75, -0.62, -0.1) },
    twirl: new V3(0, 0.03, 0.03),
  };
}

// ---------------------------------------------------------------------------------------------- blaster
function buildBlaster() {
  const P = new Parts(), I = new Parts(), T = new Parts(), PUMP = new Parts(), NEEDLE = new Parts(), BULB = new Parts();
  pistolGrip(P, { baseCol: C.dark, T });
  // pressurised ink bulb in a cream cage
  const bulb = superEllipsoid(0.066, 0.063, 0.084, 0.85, 0.9, 18, 12); BULB.add(at(bulb, 0, 0.092, 0.072));
  for (const z of [0.022, 0.072, 0.122]) { const r = torus(z === 0.072 ? 0.0655 : 0.058, 0.0068, 5, 20); P.add(at(r, 0, 0.092, z), C.cream, M.gloss); }
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    const rib = sweep([new V3(Math.cos(a) * 0.05, 0.092 + Math.sin(a) * 0.05, -0.006), new V3(Math.cos(a) * 0.069, 0.092 + Math.sin(a) * 0.069, 0.072), new V3(Math.cos(a) * 0.052, 0.092 + Math.sin(a) * 0.052, 0.148)], {
      seg: 8, radial: 4, capSteps: 2, radius: () => 0.0042, flat: 0.7, outward: (Pp, o) => o.set(Pp.x, Pp.y - 0.092, 0).normalize(),
    });
    P.add(rib.geo, C.cream, M.gloss);
  }
  const back = superEllipsoid(0.056, 0.056, 0.024, 0.6, 0.9, 14, 7); P.add(at(back, 0, 0.092, -0.016), C.cream, M.satin);
  const gauge = latheZ([[0, -0.006], [0.0128, -0.006], [0.0132, 0.0], [0.011, 0.002], [0, 0.002]], 14); P.add(at(gauge, 0, 0.092, -0.042), C.metal, M.metal);
  const face = superEllipsoid(0.0105, 0.0105, 0.001, 1, 1, 12, 4); P.add(at(face, 0, 0.092, -0.0445), C.white, M.gloss);
  // dial: 9 ticks over a 250° sweep (major every other), a red over-pressure arc, the needle on its own pivot
  for (let k = 0; k < 9; k++) {
    const a = -2.18 + (k / 8) * 4.36, major = k % 2 === 0, len = major ? 0.0028 : 0.0017;
    const tk = superEllipsoid(major ? 0.00055 : 0.0004, len / 2, 0.0003, 1, 1, 4, 4);
    tk.translate(0, 0.0083 - len / 2, 0); tk.rotateZ(a); P.add(at(tk, 0, 0.092, -0.0457), C.darker, M.print);
  }
  const red = torus(0.0079, 0.0007, 3, 10, 0.7); red.rotateZ(Math.PI / 2 + 1.5); P.add(at(red, 0, 0.092, -0.0457), C.red, M.print);
  const needle = superEllipsoid(0.00085, 0.0046, 0.00045, 0.7, 0.8, 5, 5, (q) => { q.x *= 1 - 0.75 * Math.max(0, q.y / 0.0046); });
  needle.translate(0, 0.0036, 0); NEEDLE.add(at(needle, 0, 0.092, -0.0461), C.red, M.gloss);
  const hub = lathe([[0, 0], [0.0014, 0], [0.0013, 0.0007], [0, 0.0011]], 8); hub.rotateX(-Math.PI / 2); NEEDLE.add(at(hub, 0, 0.092, -0.0459), C.dark, M.gloss);
  // bell muzzle: flared cream horn, dark throat, team lip
  const bell = latheZ(smoothProfile([[0.035, 0.13], [0.041, 0.16], [0.043, 0.2], [0.05, 0.24], [0.064, 0.29], [0.078, 0.325]], 9).concat([[0.082, 0.335], [0.078, 0.345], [0.066, 0.34], [0.05, 0.31], [0.034, 0.28], [0.0, 0.27]]), 18);
  P.add(at(bell, 0, 0.092, 0), C.cream, M.gloss);
  I.add(at(torus(0.078, 0.0068, 5, 18), 0, 0.092, 0.337));
  const inner = latheZ([[0.0, 0.275], [0.03, 0.28], [0.05, 0.305], [0.068, 0.335], [0.0, 0.335]], 16); P.add(at(inner, 0, 0.092, 0.001), C.darker, M.satin);
  for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; const fin = superEllipsoid(0.0024, 0.0125, 0.034, 0.6, 0.6, 4, 5, (q) => { q.y += 0.25 * q.z; }); fin.rotateZ(a); P.add(at(fin, Math.cos(a + Math.PI / 2) * -0.05, 0.092 + Math.sin(a + Math.PI / 2) * -0.05, 0.215), C.bone, M.satin); }
  // top carry rail + sight, side vents, decals
  const rail = superEllipsoid(0.0078, 0.0085, 0.06, 0.5, 0.6, 8, 5); P.add(at(rail, 0, 0.165, 0.05), C.dark, M.satin);
  const sight = superEllipsoid(0.0045, 0.0085, 0.006, 0.5, 0.5, 6, 4); P.add(at(sight, 0, 0.177, 0.088), C.darker, M.satin);
  for (const sx of [1, -1]) {
    for (let k = 0; k < 3; k++) { const v = superEllipsoid(0.002, 0.0026, 0.012, 0.6, 0.6, 4, 4); P.add(at(v, sx * 0.0548, 0.107 - k * 0.012, -0.012), C.darker, M.satin); }
    screw(P, new V3(sx * 0.0562, 0.075, -0.01), new V3(sx, 0, 0), 0.003);
  }
  const sq = decal(squidShape(0.03)); placeXY(sq, new V3(0, 0, -1), new V3(0, 1, 0), new V3(0.0485, 0.098, -0.02)); P.add(sq, C.decal, M.print);
  // pump foregrip for the left hand + slide tube
  const tube = latheZ([[0, 0.04], [0.0092, 0.04], [0.0092, 0.19], [0, 0.19]], 10); P.add(at(tube, 0, 0.012, 0), C.metal, M.metal);
  const stop = latheZ([[0.0092, 0.188], [0.0118, 0.19], [0.0118, 0.196], [0.0092, 0.198]], 12); P.add(at(stop, 0, 0.012, 0), C.dark, M.gloss);   // tube end stop
  const pump = latheZ(smoothProfile([[0.0, 0.118], [0.0118, 0.12], [0.0138, 0.128], [0.0138, 0.176], [0.0126, 0.186], [0.0, 0.188]], 8), 12);
  PUMP.add(at(pump, 0, 0.012, 0), C.rubber, M.rubber);
  for (let k = 0; k < 4; k++) PUMP.add(at(torus(0.0139, 0.0012, 3, 12), 0, 0.012, 0.134 + k * 0.012), C.darker, M.satin);
  const link = superEllipsoid(0.007, 0.022, 0.012, 0.5, 0.6, 6, 6); PUMP.add(at(link, 0, 0.034, 0.152), C.dark, M.satin);
  return {
    kind: 'blaster', body: P.build(), ink: I.build(),
    parts: {
      trigger: part(T, TRIGGER_PIVOT),
      pump: part(PUMP, new V3(0, 0.012, 0.152)),
      needle: part(NEEDLE, new V3(0, 0.092, -0.046)),
      bulb: part(BULB, new V3(0, 0.092, 0.072), 'ink'),
    },
    muzzle: new V3(0, 0.092, 0.345),
    gripR: GRIP_PISTOL,
    gripL: { pos: new V3(0, 0.012, 0.152), handZ: new V3(0, 0, 1), handY: new V3(0.8, -0.55, -0.1) },
    twirl: new V3(0, 0.03, 0.03),
  };
}

// ---------------------------------------------------------------------------------------------- dualies (one pistol)
// "Twinfin Dualies": a compact pistol per hand. Polymer frame + accessory rail, a cream slide that snaps back on every
// shot of its own hand (team-ink dorsal fin + ink window ride on it), turned nozzle, an ink capsule slung under the
// muzzle, rear status LED facing the player. The LEFT hand holds a second instance (def.dual: handL / inHandL below).
function buildDualies() {
  const P = new Parts(), I = new Parts(), T = new Parts(), SL = new Parts(), SLI = new Parts(), LED = new Parts();
  pistolGrip(P, { T, baseCol: C.dark });
  const frame = superEllipsoid(0.0185, 0.0105, 0.072, 0.4, 0.5, 12, 6, (q) => { if (q.z > 0.05) q.y *= 1 - 0.25 * (q.z - 0.05) / 0.022; });
  P.add(at(frame, 0, 0.041, 0.034), C.dark, M.satin);
  const rail = superEllipsoid(0.0105, 0.0035, 0.034, 0.4, 0.4, 8, 4); P.add(at(rail, 0, 0.0282, 0.086), C.darker, M.satin);
  for (let k = 0; k < 4; k++) P.add(at(superEllipsoid(0.0112, 0.0012, 0.0022, 0.6, 0.6, 6, 4), 0, 0.0252, 0.072 + k * 0.009), C.gunmetal, M.metal);
  // ink capsule under the muzzle
  const cap = latheZ(smoothProfile([[0, -0.027], [0.0092, -0.025], [0.0098, -0.017], [0.0098, 0.017], [0.0092, 0.025], [0, 0.027]], 6), 12);
  const CY = 0.0152;
  I.add(at(cap, 0, CY, 0.1));
  for (const z of [0.074, 0.126]) P.add(at(latheZ([[0, z - 0.0035], [0.011, z - 0.0035], [0.0114, z + 0.0035], [0, z + 0.0035]], 12), 0, CY, 0), C.dark, M.gloss);
  for (let k = 0; k < 3; k++) { const a = (k / 3) * Math.PI * 2 + 0.6; P.add(at(superEllipsoid(0.0018, 0.0018, 0.024, 0.6, 0.6, 4, 4), Math.cos(a) * 0.0104, CY + Math.sin(a) * 0.0104, 0.1), C.dark, M.satin); }
  for (const z of [0.08, 0.12]) P.add(at(superEllipsoid(0.0062, 0.0062, 0.0042, 0.6, 0.6, 6, 4), 0, 0.0245, z), C.dark, M.satin);   // clamp lugs to the rail
  // turned nozzle (static; the slide rides over its root)
  const noz = latheZ([[0.0, 0.098], [0.0102, 0.098], [0.0102, 0.126], [0.0118, 0.129], [0.0121, 0.14], [0.0109, 0.144], [0.0076, 0.1465], [0.0064, 0.141], [0.0, 0.14]], 12);
  P.add(at(noz, 0, 0.0645, 0), C.gunmetal, M.metal);
  I.add(at(torus(0.0112, 0.0026, 4, 14), 0, 0.0645, 0.1345));
  // slide (moving): cream shell, serrations, sights, ink window + dorsal fin (ink, rides along)
  const slide = superEllipsoid(0.0198, 0.0165, 0.078, 0.38, 0.55, 14, 8, (q) => { if (q.z > 0.05) q.y *= 1 - 0.22 * (q.z - 0.05) / 0.028; if (q.y > 0) q.x *= 1 - 0.1 * q.y / 0.0165; });
  SL.add(at(slide, 0, 0.0645, 0.03), C.cream, M.satin);
  for (const sx of [1, -1]) for (let k = 0; k < 5; k++) SL.add(at(superEllipsoid(0.0007, 0.0105, 0.0011, 0.8, 0.8, 4, 4), sx * 0.0194, 0.066, -0.043 + k * 0.0048), C.darker, M.satin);
  const rear = superEllipsoid(0.0085, 0.0048, 0.0042, 0.4, 0.4, 6, 4, (q) => { if (q.y > 0.0015 && Math.abs(q.x) < 0.0024) q.y = 0.0015; });
  SL.add(at(rear, 0, 0.0838, -0.036), C.darker, M.satin);
  SL.add(at(superEllipsoid(0.0018, 0.0048, 0.003, 0.6, 0.6, 5, 4), 0, 0.0826, 0.097), C.darker, M.satin);
  SLI.add(at(superEllipsoid(0.0007, 0.0052, 0.0145, 0.7, 0.7, 5, 6), -0.0196, 0.0685, 0.042));
  SLI.add(at(superEllipsoid(0.0007, 0.0052, 0.0145, 0.7, 0.7, 5, 6), 0.0196, 0.0685, 0.042));
  const fin = superEllipsoid(0.0031, 0.0105, 0.026, 0.6, 0.7, 6, 7, (q) => { const h = (q.y + 0.0105) / 0.021; q.z -= 0.024 * h; q.z *= 1 - 0.45 * h; q.x *= 1 - 0.4 * h; });
  SLI.add(at(fin, 0, 0.0865, 0.012));
  // decals + screws on the frame
  const sq = decal(squidShape(0.02)); placeXY(sq, new V3(0, 0, -1), new V3(0, 1, 0), new V3(0.0188, 0.041, 0.02)); P.add(sq, C.decal, M.print);
  for (const s of chevronShape(0.022, 0.0065, 3, 0.45)) { const g = decal(s); placeXY(g, new V3(0, 0, 1), new V3(0, 1, 0), new V3(-0.0188, 0.038, 0.012)); P.add(g, C.hazard, M.print); }
  for (const sx of [1, -1]) screw(P, new V3(sx * 0.0186, 0.043, 0.07), new V3(sx, 0, 0), 0.0024);
  // status LED on the back of the slide (faces the player)
  const led = superEllipsoid(0.0028, 0.0028, 0.0014, 1, 1, 8, 4); LED.add(at(led, 0.009, 0.074, -0.049), C.green, M.led);
  P.add(at(torus(0.0032, 0.0008, 3, 10), 0.009, 0.074, -0.0484), C.darker, M.satin);
  return {
    kind: 'dualies', body: P.build(), ink: I.build(),
    parts: {
      trigger: part(T, TRIGGER_PIVOT),
      slide: part(SL, new V3(0, 0.0645, 0.03)),
      slideInk: part(SLI, new V3(0, 0.0645, 0.03), 'ink'),
      led: part(LED, new V3(0.009, 0.074, -0.049), 'lamp', { color: '#0f2a18', emissive: '#3dff7a', intensity: 1.3 }),
    },
    muzzle: new V3(0, 0.0645, 0.147),
    gripR: GRIP_PISTOL,
    gripL: GRIP_PISTOL,          // dual: the left hand holds its own pistol by the same grip (see getWeaponDef → dual)
    dual: true,
    twirl: new V3(0, 0.03, 0.03),
  };
}

// ---------------------------------------------------------------------------------------------- slosher
// "Tidebucket Slosher": a thick-walled pail on a pitcher handle (right hand), a rubber carry bar under the front of the
// base (left hand, let go for the throw), hoops, a team-ink band, a pour lip, and the ink inside: a static fill plus a
// free surface disc (part 'surface' — kept level against the swing, rippling, drawn down by each throw). Thumb lever on
// the handle ('lever') trips as the ink leaves. Bucket axis = +Y; the throw goes out over the lip (+Z).
function buildSlosher() {
  const P = new Parts(), I = new Parts(), SURF = new Parts(), LEV = new Parts();
  const BZ = 0.148, BY = 0.012;
  const shell = lathe(smoothProfile([[0.0, -0.078], [0.074, -0.078], [0.083, -0.071], [0.1, 0.07], [0.106, 0.088], [0.112, 0.094]], 10)
    .concat([[0.1135, 0.0985], [0.1085, 0.1025], [0.1005, 0.098], [0.0945, 0.085], [0.0785, -0.06], [0.0, -0.062]]), 28);
  P.add(at(shell, 0, BY, BZ), C.cream, M.gloss);
  const wallR = (y) => 0.083 + (0.1 - 0.083) * ((y + 0.071) / 0.141);   // outer wall radius of the shell profile
  for (const y of [-0.045, 0.058]) { const h = torus(wallR(y) + 0.0035, 0.0042, 5, 30); h.rotateX(Math.PI / 2); P.add(at(h, 0, BY + y, BZ), C.dark, M.gloss); }
  const band = lathe([[wallR(-0.022) + 0.0005, -0.024], [wallR(-0.02) + 0.0028, -0.02], [wallR(0.03) + 0.0028, 0.03], [wallR(0.034) + 0.0005, 0.034]], 28); I.add(at(band, 0, BY, BZ));
  // ink run down the outside from the pour lip: three drips hugging the wall, fattest at their tips
  for (const [a, len] of [[0.12, 0.05], [-0.22, 0.034], [0.42, 0.024]]) {
    const y0 = 0.094, y1 = y0 - len, pts = [];
    for (let i = 0; i <= 4; i++) { const y = y0 - (y0 - y1) * (i / 4), r = wallR(y) + 0.0022; pts.push(new V3(Math.sin(a) * r, y, Math.cos(a) * r)); }
    const dr = sweep(pts, { seg: 8, radial: 6, capSteps: 2, radius: (t) => 0.0034 + 0.0032 * t * t, flat: 0.75, outward: (Pp, o) => o.set(Pp.x, 0, Pp.z).normalize() });
    I.add(at(dr.geo, 0, BY, BZ));
  }
  // pour lip at the front of the rim
  const lip = superEllipsoid(0.034, 0.006, 0.02, 0.5, 0.7, 10, 5, (q) => { q.y += 0.18 * q.z; q.x *= 1 - 0.4 * Math.max(0, q.z / 0.02); });
  P.add(at(lip, 0, BY + 0.097, BZ + 0.112), C.cream, M.gloss);
  // the ink: static fill + the free surface (part)
  const fill = lathe([[0.0, -0.059], [0.0775, -0.058], [0.0905, 0.048], [0.0, 0.048]], 24); I.add(at(fill, 0, BY, BZ));
  const surf = superEllipsoid(0.0905, 0.0045, 0.0905, 1, 0.9, 26, 5, (q) => { const r = Math.hypot(q.x, q.z); q.y += 0.0022 * Math.sin(r * 140) * Math.max(0, 1 - r / 0.09); });
  SURF.add(at(surf, 0, BY + 0.05, BZ));
  // pitcher handle: grooved vertical grip on two swept brackets
  const core = superEllipsoid(0.0118, 0.05, 0.0138, 0.62, 0.7, 12, 12, (q) => { if (q.z > 0) { const f = 0.5 + 0.5 * Math.cos((q.y / 0.0125) * Math.PI * 2); q.z -= 0.0015 * f * (Math.abs(q.y) < 0.04 ? 1 : 0); } });
  P.add(core, C.darker, M.satin);
  for (const sx of [1, -1]) { const pn = superEllipsoid(0.0028, 0.036, 0.0105, 0.5, 0.55, 5, 8); P.add(at(pn, sx * 0.0104, 0, -0.002), C.rubber, M.rubber); }
  for (const [y0, y1, z1] of [[0.045, BY + 0.062, BZ - wallR(0.05) + 0.004], [-0.046, BY - 0.05, BZ - wallR(-0.062) + 0.004]]) {
    const br = sweep([new V3(0, y0, 0.002), new V3(0, (y0 + y1) / 2 + (y0 > 0 ? 0.012 : -0.008), z1 * 0.5), new V3(0, y1, z1)], { seg: 8, radial: 6, capSteps: 2, radius: () => 0.0085, flat: 1.5, outward: (Pp, o) => o.set(1, 0, 0) });
    P.add(br.geo, C.dark, M.gloss);
  }
  P.add(at(superEllipsoid(0.0138, 0.0046, 0.0165, 0.45, 0.5, 10, 4), 0, -0.053, -0.001), C.dark, M.gloss);   // pommel
  // thumb lever on top of the handle (trips on the throw)
  const lev = superEllipsoid(0.0072, 0.0026, 0.016, 0.5, 0.6, 6, 4, (q) => { q.y += 0.12 * q.z; }); LEV.add(at(lev, 0, 0.0555, -0.004), C.metal, M.metal);
  // carry bar under the front of the base (left hand): rubber sleeve on two struts
  const bar = latheZ(smoothProfile([[0, -0.036], [0.0104, -0.035], [0.0112, -0.028], [0.0112, 0.028], [0.0104, 0.035], [0, 0.036]], 6), 12);
  bar.rotateY(Math.PI / 2); P.add(at(bar, 0, BY - 0.1, BZ + 0.052), C.rubber, M.rubber);
  for (const sx of [1, -1]) P.add(at(superEllipsoid(0.0045, 0.012, 0.0065, 0.6, 0.6, 5, 5), sx * 0.03, BY - 0.088, BZ + 0.05), C.dark, M.satin);
  // decals: squid glyph on the left flank, wave chevrons on the right
  const sq = decal(squidShape(0.045)); placeXY(sq, new V3(0, 0, -1), new V3(0, 1, 0.06), new V3(0.097, BY + 0.012, BZ)); P.add(sq, C.dark, M.print);
  for (const s of chevronShape(0.05, 0.014, 3, 0.4)) { const g = decal(s); placeXY(g, new V3(0, 0, 1), new V3(0, 1, 0.06), new V3(-0.0975, BY + 0.005, BZ - 0.025)); P.add(g, C.dark, M.print); }
  return {
    kind: 'slosher', body: P.build(), ink: I.build(),
    parts: {
      surface: part(SURF, new V3(0, BY + 0.05, BZ), 'ink'),
      lever: part(LEV, new V3(0, 0.0555, 0.012)),
    },
    muzzle: new V3(0, BY + 0.1, BZ + 0.03),
    gripR: { pos: new V3(0, 0, 0), handZ: new V3(0, 1, 0.1), handY: new V3(0, 0.12, -1) },
    gripL: { pos: new V3(0, BY - 0.1, BZ + 0.052), handZ: new V3(-1, 0, 0), handY: new V3(0.25, -0.85, 0.45) },
    twirl: new V3(0, 0.02, 0.08),
  };
}

// ---------------------------------------------------------------------------------------------- splatling
// "Gyre Splatling": rear pistol grip + vertical foregrip, a vented motor housing, a windowed ink drum on top with an
// 8-segment charge meter on its back face (per-vertex aSeg → makeCoilMaterial, faces the player), and a six-barrel
// cluster ('barrels') that spins up with the charge and screams while it streams.
function buildSplatling() {
  const P = new Parts(), I = new Parts(), T = new Parts(), BAR = new Parts(), G = new Parts();
  pistolGrip(P, { T });
  const hous = superEllipsoid(0.031, 0.04, 0.115, 0.38, 0.55, 14, 10, (q) => { if (q.z > 0.07) q.y *= 1 - 0.28 * (q.z - 0.07) / 0.045; if (q.y > 0) q.x *= 1 - 0.1 * q.y / 0.04; });
  P.add(at(hous, 0, 0.07, 0.055), C.white, M.satin);
  const low = superEllipsoid(0.027, 0.012, 0.105, 0.4, 0.5, 12, 5); P.add(at(low, 0, 0.036, 0.06), C.dark, M.satin);
  const spine = superEllipsoid(0.0165, 0.006, 0.08, 0.5, 0.6, 12, 5); I.add(at(spine, 0, 0.1085, 0.085));
  for (const sx of [1, -1]) {
    for (let k = 0; k < 4; k++) P.add(at(superEllipsoid(0.0012, 0.0062, 0.0105, 0.6, 0.6, 4, 5), sx * 0.0305, 0.07, 0.012 + k * 0.024), C.darker, M.satin);
    for (const [y, z] of [[0.09, -0.04], [0.09, 0.14], [0.046, 0.15]]) screw(P, new V3(sx * 0.0302, y, z), new V3(sx, 0, 0), 0.0026);
  }
  const sq = decal(squidShape(0.026)); placeXY(sq, new V3(0, 0, -1), new V3(0, 1, 0), new V3(0.0308, 0.066, 0.12)); P.add(sq, C.decal, M.print);
  // ink drum on top: windowed cylinder along Z, cage bars, end caps; the charge meter ring on the rear cap
  const DY = 0.148, DZ = 0.045;
  I.add(at(latheZ([[0, -0.052], [0.0395, -0.051], [0.0405, -0.044], [0.0405, 0.044], [0.0395, 0.051], [0, 0.052]], 18), 0, DY, DZ));
  for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2 + 0.26; P.add(at(superEllipsoid(0.0034, 0.0034, 0.047, 0.6, 0.6, 4, 4), Math.cos(a) * 0.0425, DY + Math.sin(a) * 0.0425, DZ), C.dark, M.satin); }
  for (const [z, s] of [[DZ - 0.056, -1], [DZ + 0.056, 1]]) P.add(at(latheZ([[0, -0.007 * s], [0.0455, -0.007 * s], [0.047, -0.002 * s], [0.047, 0.005 * s], [0.042, 0.0085 * s], [0, 0.009 * s]], 20), 0, DY, z), C.dark, M.gloss);
  for (let i = 0; i < 8; i++) {
    const a0 = Math.PI / 2 - (i / 8) * Math.PI * 2 - 0.06, seg = torus(0.03, 0.0042, 4, 6, (Math.PI * 2) / 8 - 0.12);
    seg.rotateZ(a0 - (Math.PI * 2) / 8 + 0.12); G.add(at(seg, 0, DY, DZ - 0.0655), '#ffffff');
  }
  P.add(at(torus(0.03, 0.0062, 4, 24).translate(0, 0, 0.002), 0, DY, DZ - 0.063), C.darker, M.satin);
  // drum feed neck into the housing
  P.add(at(latheZ([[0.012, 0], [0.014, 0.004], [0.014, 0.02], [0.012, 0.024]], 12).rotateX(-Math.PI / 2), 0, 0.104, 0.1), C.metal, M.metal);
  // barrel cluster (spins about Z at y 0.07): six barrels, hex clamp plates, spindle, crown
  const AX = 0.07, R = 0.019;
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    const b = latheZ([[0, 0.17], [0.0074, 0.17], [0.0074, 0.452], [0.0082, 0.456], [0.0082, 0.462], [0.0048, 0.4625], [0, 0.46]], 8);
    BAR.add(at(b, Math.cos(a) * R, AX + Math.sin(a) * R, 0), C.gunmetal, M.metal);
  }
  for (const [z, th] of [[0.19, 0.008], [0.33, 0.006], [0.435, 0.007]]) {
    const plate = latheZ([[0, z - th], [0.031, z - th], [0.0325, z], [0.031, z + th], [0, z + th]], 6); BAR.add(at(plate, 0, AX, 0), C.dark, M.gloss);
  }
  BAR.add(at(latheZ([[0, 0.17], [0.006, 0.17], [0.006, 0.45], [0, 0.45]], 8), 0, AX, 0), C.metal, M.metal);
  I.add(at(torus(0.0325, 0.0028, 4, 18), 0, AX, 0.4375));
  // static shroud + cooling jacket over the barrel roots
  P.add(at(latheZ(smoothProfile([[0.03, 0.165], [0.036, 0.17], [0.037, 0.19], [0.036, 0.255], [0.031, 0.262]], 6), 16), 0, AX, 0), C.white, M.satin);
  for (let k = 0; k < 4; k++) P.add(at(torus(0.0368, 0.0016, 3, 18), 0, AX, 0.2 + k * 0.016), C.darker, M.satin);
  // vertical foregrip for the left hand
  const fg = superEllipsoid(0.0118, 0.03, 0.0132, 0.55, 0.65, 10, 8, (q) => { if (q.z > 0) { const f = 0.5 + 0.5 * Math.cos((q.y / 0.0125) * Math.PI * 2); q.z -= 0.0012 * f; } });
  fg.rotateX(-0.12); P.add(at(fg, 0, 0.0, 0.152), C.darker, M.satin);
  P.add(at(superEllipsoid(0.0124, 0.019, 0.0095, 0.5, 0.55, 8, 6).rotateX(-0.12), 0, -0.004, 0.151), C.rubber, M.rubber);
  P.add(at(superEllipsoid(0.0134, 0.0042, 0.0152, 0.5, 0.5, 10, 4), 0, -0.031, 0.155), C.dark, M.gloss);
  const glow = G.build();
  {
    // meter segments light clockwise from the top as the charge builds: aSeg = segment index / 8 threshold
    const pz = glow.attributes.position, seg = new Float32Array(pz.count);
    for (let i = 0; i < pz.count; i++) {
      let a = Math.atan2(pz.getY(i) - DY, pz.getX(i)); let u = (Math.PI / 2 - a) / (Math.PI * 2); u -= Math.floor(u);
      seg[i] = (Math.floor(u * 8) + 1) / 8 - 0.02;
    }
    glow.setAttribute('aSeg', new THREE.Float32BufferAttribute(seg, 1));
  }
  return {
    kind: 'splatling', body: P.build(), ink: I.build(), glow,
    parts: { trigger: part(T, TRIGGER_PIVOT), barrels: part(BAR, new V3(0, AX, 0.3)) },
    muzzle: new V3(0, AX, 0.466),
    gripR: GRIP_PISTOL,
    gripL: { pos: new V3(0, 0.0, 0.1515), handZ: new V3(0, 1, -0.12), handY: new V3(0.45, -0.05, -1) },
    twirl: new V3(0, 0.03, 0.05),
  };
}

const _cache = new Map();
const BUILDERS = { shooter: buildShooter, roller: buildRoller, charger: buildCharger, blaster: buildBlaster, dualies: buildDualies, slosher: buildSlosher, splatling: buildSplatling };
export const WEAPON_KINDS = Object.keys(BUILDERS);

/** Hand bone frame (wrist origin) expressed in weapon space, from a grip spec and that hand's grip-hole offset. */
function handInWeapon(grip, hole) {
  const Y = grip.handY.clone().normalize();
  const Z = grip.handZ.clone().addScaledVector(Y, -grip.handZ.dot(Y)).normalize();
  const X = new V3().crossVectors(Y, Z).normalize();
  const m = new THREE.Matrix4().makeBasis(X, Y, Z);
  const q = new THREE.Quaternion().setFromRotationMatrix(m);
  const pos = grip.pos.clone().sub(hole.clone().applyQuaternion(q));
  return { pos, quat: q };
}

// ---------------------------------------------------------------------------------------------- part animation
// Arsenal owns how weapon parts move; character.js owns the body. character.js calls animateWeapon(w, st) once per
// frame per held weapon instance (the main one, and the left-hand one for dual wield):
//   w  = the instance it built (def, parts, body/ink/bodyFar/inkFar, drum, coil, lamps; state lives on it)
//   st = { t, dt, color, near,                      // clock, frame dt, team colour, near-LOD flag (false → merged far mesh)
//          hand,                                    // 0 = main (right) instance, 1 = left-hand instance (dual wield)
//          runner,                                  // the actor's WeaponRunner (null in labs/menus) — read-only (charging, streaming,
//                                                   //   burstFrac, sinceHand[2], dodge, lockT … see weapons.js)
//          sinceShoot, sinceFlick, sinceRelease,    // seconds since trigger 'shoot' / 'flick' / 'charge_release'
//          charge, full, chargeFlash, lowInk,       // smoothed charge 0..1, at-full flag, release flash 0..1, low-ink weight 0..1
//          firing, rolling, grounded, groundSpeed,  // AnimState bits (rolling = roller push weight 0..1)
//          worldQuat }                              // world quaternion of the weapon (w.off) — liquid surfaces stay level
// Writes: part transforms, lamp/coil uniforms, LOD visibility, and w.pump (0..1 blaster pump stroke — the body's left
// hand should ride it) + w.trig (0..1 trigger squeeze — the index finger can follow).
const _aq = new THREE.Quaternion(), _aq2 = new THREE.Quaternion(), _av = new V3(), _av2 = new V3(), _aw = new THREE.Color(1, 1, 1);
const _UPV = new V3(0, 1, 0);
const pulseE = (t, atk, dec) => (t < 0 ? 0 : t < atk ? t / atk : Math.exp(-(t - atk) * dec));
const mjE = (t) => { t = Math.min(1, Math.max(0, t)); return t * t * t * (10 + t * (6 * t - 15)); };
const dampE = (a, b, l, dt) => a + (b - a) * (1 - Math.exp(-l * dt));
function sprE(S, i, target, hz, zeta, dt) {   // exact damped spring (stable for any damping / step)
  const w = Math.PI * 2 * hz, x0 = S[i] - target, v0 = S[i + 1];
  let x, v;
  if (zeta < 0.999) {
    const wd = w * Math.sqrt(1 - zeta * zeta), e = Math.exp(-zeta * w * dt), c = Math.cos(wd * dt), sn = Math.sin(wd * dt), B = (v0 + zeta * w * x0) / wd;
    x = e * (x0 * c + B * sn); v = e * ((-zeta * w * x0 + wd * B) * c + (-zeta * w * B - wd * x0) * sn);
  } else { const e = Math.exp(-w * dt), B = v0 + w * x0; x = e * (x0 + B * dt); v = e * (v0 - w * B * dt); }
  S[i] = x + target; S[i + 1] = v; return S[i];
}

export function animateWeapon(w, st) {
  const d = w.def, P = w.parts || {}, kind = d.kind, t = st.t, dt = Math.min(0.1, Math.max(0, st.dt || 0)), col = st.color;
  if (!w.ps) { w.ps = new Float32Array(12); w.ps[0] = 1.3; w.pump = 0; w.trig = 0; w.heat = 0; w.drumW = 0; w.drumA = 0; w.spinW = 0; w.spinA = 0; w.near = true; }
  const ps = w.ps, R = st.runner;
  // per-instance shot clock: dual wield keeps one per hand (runner.sinceHand = [right, left] seconds since that hand fired)
  let ts = st.sinceShoot ?? 99;
  if (d.dual && R && R.sinceHand) ts = R.sinceHand[st.hand || 0];
  // near/far LOD
  const near = st.near !== false;
  if (near !== w.near) {
    w.near = near;
    if (w.body) w.body.visible = near; if (w.ink) w.ink.visible = near;
    if (w.bodyFar) w.bodyFar.visible = !near; if (w.inkFar) w.inkFar.visible = !near;
    for (const g of w.partList || []) g.visible = near;
  }
  // roller drum: rolls with the ground, coasts down, gets flung round by the flick
  if (w.drum) {
    if ((st.rolling || 0) > 0.3 && st.grounded) w.drumW = (st.groundSpeed || 0) / (d.drumR || 0.1);
    else w.drumW *= Math.exp(-dt * 2.2);
    const ft = st.sinceFlick ?? 99;
    if (ft >= 0.15 && ft - dt < 0.15) w.drumW += 34;
    w.drumA += w.drumW * dt;
    w.drum.rotation.x = w.drumA;
  }
  const u = st.sinceShoot ?? 99;
  if (kind === 'blaster') {   // pump stroke — computed at every distance (the body's left hand rides it)
    let pk = 0;
    if (u < 0.6) pk = u < 0.14 ? 0 : u < 0.29 ? mjE((u - 0.14) / 0.15) : u < 0.33 ? 1 : u < 0.46 ? 1 - mjE((u - 0.33) / 0.13) : -0.1 * Math.sin(Math.PI * Math.min(1, (u - 0.46) / 0.12));
    w.pump = pk;
  }
  if (w.coil) {                 // charger coil / splatling meter (always drawn — a charging weapon is a tell at any range)
    const cu = w.coil.userData.u;
    let ch = st.charge || 0, full = st.full ? 1 : 0;
    if (kind === 'splatling' && R) { ch = R.charging ? R.charge : R.streaming ? R.burstFrac : 0; full = R.charging && R.charge >= 0.999 ? 1 : 0; }
    cu.uCharge.value = ch; cu.uFull.value = full; cu.uFlash.value = st.chargeFlash || 0; cu.uTime.value = t;
  }
  if (!near) return;
  const shotK = pulseE(ts, 0.006, 30);
  if (P.trigger) {
    const want = kind === 'charger' ? ((st.charge || 0) > 0.01 ? 1 : 0) : kind === 'splatling' ? (R ? (R.charging || R.streaming ? 1 : 0) : (st.firing ? 1 : 0))
      : kind === 'blaster' || kind === 'dualies' ? (ts < 0.07 ? 1 : 0) : (st.firing && u < 0.16 ? 1 : 0);
    w.trig = dampE(w.trig, want, want > w.trig ? 45 : 22, dt);
    P.trigger.rotation.x = 0.42 * w.trig;
  }
  if (kind === 'shooter') {
    P.bolt.position.z = P.bolt.userData.rest.z - 0.0095 * shotK;
    const ck = pulseE(ts, 0.01, 18);
    P.can.scale.set(1 + 0.07 * ck, 1 + 0.07 * ck, 1 - 0.035 * ck);
    ledShot(P.led, st, shotK, t);
  } else if (kind === 'dualies') {
    // each pistol's slide snaps back 13 mm on its own shot and rides home; LED blinks per shot / red when low
    const k = pulseE(ts, 0.005, 26);
    P.slide.position.z = P.slide.userData.rest.z - 0.013 * k;
    P.slideInk.position.z = P.slideInk.userData.rest.z - 0.013 * k;
    ledShot(P.led, st, k, t);
  } else if (kind === 'blaster') {
    P.pump.position.z = P.pump.userData.rest.z - 0.036 * w.pump;
    const dep = u < 0.36;
    const needle = sprE(ps, 0, dep ? -1.95 : 1.3, dep ? 9 : 4.2, dep ? 0.55 : 0.28, dt);
    P.needle.rotation.z = needle + 0.018 * Math.sin(t * 41) * (u > 0.6 ? 1 : 0.3);
    if (ts < dt * 1.5) ps[3] -= 7;
    if (u >= 0.33 && u - dt < 0.33) ps[3] += 4.5;
    const bq = Math.max(-0.3, Math.min(0.3, sprE(ps, 2, 0, 7, 0.22, dt)));
    P.bulb.scale.set(1 - 0.35 * bq, 1 - 0.35 * bq, 1 + 0.9 * bq);
  } else if (kind === 'charger') {
    const ch = st.charge || 0, full = st.full ? 1 : 0;
    const btg = -0.03 * Math.min(1, Math.max(0, ch));
    const bolt = sprE(ps, 4, btg, btg < ps[4] ? 5 : 16, 0.32, dt);
    P.bolt.position.z = P.bolt.userData.rest.z + Math.min(0.004, Math.max(-0.034, bolt));
    const lm = P.lens.userData.mesh.material;
    lm.emissive.copy(col).lerp(_aw, 0.25 * full);
    lm.emissiveIntensity = 0.12 + 3.2 * ch * ch + full * (1.2 + 0.8 * Math.sin(t * 31)) + 5 * (st.chargeFlash || 0);
    const em = P.eyepiece.userData.mesh.material;
    em.emissive.copy(col); em.emissiveIntensity = 0.04 + 0.9 * ch * ch + 0.6 * full;
    const rel = st.sinceRelease ?? 99;
    if (rel < dt * 1.5) w.heat = 1;
    w.heat *= Math.exp(-dt * 3.2);
    const pm = P.ports.userData.mesh.material;
    pm.emissive.copy(col).lerp(_aw, 0.5 * w.heat); pm.emissiveIntensity = 6 * w.heat * w.heat;
  } else if (kind === 'roller') {
    const m = P.led.userData.mesh.material;
    m.emissiveIntensity = (st.rolling || 0) > 0.3 ? 0.5 + 2.6 * (Math.sin(t * Math.PI * 8) > 0 ? 1 : 0.15) : 0.45;
  } else if (kind === 'slosher') {
    // the ink surface stays level against the swing (a lagging, ringing liquid, clamped to the rim), dips as each
    // throw empties the bucket and wells back up; the thumb lever trips as the ink leaves
    const s = P.surface;
    if (st.worldQuat) {
      _av.copy(_UPV).applyQuaternion(st.worldQuat);                     // bucket axis in world
      _aq.setFromUnitVectors(_av, _UPV);                                 // world tilt that would level the surface
      _aq2.copy(st.worldQuat).invert().multiply(_aq).multiply(st.worldQuat);   // … expressed in bucket space
      _av2.set(_aq2.x, _aq2.y, _aq2.z); const sn = _av2.length();
      let ang = 2 * Math.atan2(sn, _aq2.w); if (ang > Math.PI) ang -= Math.PI * 2;
      const lim = 0.6, a = Math.max(-lim, Math.min(lim, ang));
      if (sn > 1e-5) _av2.multiplyScalar(1 / sn); else _av2.set(1, 0, 0);
      sprE(ps, 6, _av2.x * a, 2.2, 0.16, dt); sprE(ps, 8, _av2.z * a, 2.2, 0.16, dt);
    }
    s.rotation.set(ps[6], 0, ps[8]);
    const drain = u < 0.6 ? (u < 0.16 ? mjE(u / 0.16) : 1 - mjE((u - 0.16) / 0.44)) : 0;
    s.position.y = s.userData.rest.y - 0.034 * drain + 0.002 * Math.sin(t * 7.3);
    const rip = 1 + 0.02 * Math.sin(t * 11 + 1.3) * (0.3 + drain);
    s.scale.set(rip * (1 - 0.1 * drain), 1, (2 - rip) * (1 - 0.1 * drain));
    P.lever.rotation.x = -0.4 * (u < 0.3 ? 1 - mjE(Math.max(0, u - 0.18) / 0.12) : 0);
  } else if (kind === 'splatling') {
    // barrel cluster: spins up with the charge, screams while it streams, spins down with inertia
    let want = 0;
    if (R) want = R.charging ? 14 + 46 * R.charge : R.streaming ? 64 : 0;
    else want = st.firing ? 30 + 30 * (st.charge || 0) : 0;
    w.spinW = dampE(w.spinW, want, want > w.spinW ? 5 : 1.6, dt);
    w.spinA = (w.spinA + w.spinW * dt) % (Math.PI * 2);
    P.barrels.rotation.z = w.spinA;
    P.barrels.position.z = P.barrels.userData.rest.z - 0.004 * shotK;   // each round nudges the cluster back
  }
}
function ledShot(g, st, k, t) {
  if (!g) return;
  const m = g.userData.mesh.material;
  if ((st.lowInk || 0) > 0.5) { m.emissive.setRGB(1, 0.16, 0.1); m.emissiveIntensity = 0.4 + 2.2 * (0.5 + 0.5 * Math.sin(t * Math.PI * 6.4)); }
  else { m.emissive.setRGB(0.24, 1, 0.48); m.emissiveIntensity = 1.1 + 4 * k; }
}

// ---------------------------------------------------------------------------------------------- sub: splat bomb prop
/** Hand-held splat bomb (held by its knurled cap in the LEFT fist while the sub is aimed).
 *  Bomb space: cap handle axis along +Y through the origin; ink bulb hangs below. */
function buildBomb() {
  const P = new Parts(), I = new Parts();
  P.add(lathe(smoothProfile([[0, -0.014], [0.0118, -0.014], [0.0128, -0.008], [0.0128, 0.009], [0.0104, 0.0145], [0, 0.0155]], 8), 14), C.rubber, M.rubber);
  P.add(lathe([[0, 0.015], [0.0048, 0.015], [0.0048, 0.021], [0.0062, 0.0225], [0, 0.024]], 8), C.metal, M.metal);
  P.add(lathe(smoothProfile([[0, -0.03], [0.022, -0.029], [0.0215, -0.019], [0.0142, -0.0145], [0, -0.014]], 6), 16), C.dark, M.gloss);
  const bulb = lathe(smoothProfile([[0, -0.118], [0.03, -0.114], [0.047, -0.098], [0.052, -0.074], [0.046, -0.05], [0.031, -0.034], [0.0185, -0.027], [0, -0.026]], 14), 20);
  I.add(bulb);
  P.add(at(torus(0.0515, 0.0042, 5, 20), 0, 0, 0).rotateX(Math.PI / 2).translate(0, -0.074, 0), C.cream, M.gloss);
  for (let k = 0; k < 3; k++) { const a = (k / 3) * Math.PI * 2; const fin = superEllipsoid(0.0035, 0.018, 0.012, 0.6, 0.6, 4, 5); fin.rotateY(a); P.add(at(fin, Math.sin(a) * 0.043, -0.052, Math.cos(a) * 0.043), C.cream, M.gloss); }
  const led = superEllipsoid(0.0028, 0.0028, 0.0028, 1, 1, 8, 5); P.add(at(led, 0, -0.022, 0.0205), C.red, M.led);
  const sq = decal(squidShape(0.026)); placeXY(sq, new V3(1, 0, 0), new V3(0, 1, 0), new V3(0, -0.075, 0.0548)); P.add(sq, C.decal, M.print);
  return { kind: 'bomb', body: P.build(), ink: I.build(), grip: { pos: new V3(0, 0, 0), handZ: new V3(0, 1, 0), handY: new V3(0.3, 0.1, -1) } };
}
const _subCache = new Map();
/** Sub-weapon prop for the LEFT hand: { body, ink, handL:{pos,quat} (hand in prop space), inHandL:{pos,quat} (prop in hand space) }.
 *  Attach like a weapon: prop group under handL at inHandL (plastic body + team ink material). */
export function getSubDef(kind = 'bomb') {
  if (!_subCache.has(kind)) {
    const d = buildBomb();
    d.handL = handInWeapon(d.grip, GRIP_HOLE_L);
    const inv = new THREE.Matrix4().compose(d.handL.pos, d.handL.quat, new V3(1, 1, 1)).invert();
    d.inHandL = { pos: new V3(), quat: new THREE.Quaternion() };
    inv.decompose(d.inHandL.pos, d.inHandL.quat, new V3());
    _subCache.set(kind, d);
  }
  return _subCache.get(kind);
}

/** Split a builder's output: bodyStatic/inkStatic (never move), parts re-centred on their pivots, and body/ink = the
 *  complete weapon at rest (static + parts merged in place) for tools that render it whole. */
function finishParts(d) {
  d.bodyStatic = d.body; d.inkStatic = d.ink;
  const body = [d.body], ink = [d.ink];
  const parts = d.parts || {};
  for (const k in parts) {
    const p = parts[k];
    if (!p.src) continue;
    (p.mat === 'ink' ? ink : body).push(p.src);
    p.geo = p.src.clone().translate(-p.pivot.x, -p.pivot.y, -p.pivot.z);
    delete p.src;
  }
  d.body = body.length > 1 ? mergeGeometries(body.filter(Boolean), false) : d.body;
  d.ink = ink.length > 1 ? mergeGeometries(ink.filter(Boolean), false) : d.ink;
  d.parts = parts;
  return d;
}

export function getWeaponDef(kind) {
  if (!_cache.has(kind)) {
    const d = finishParts((BUILDERS[kind] || buildShooter)());
    d.handR = handInWeapon(d.gripR, GRIP_HOLE_R);
    d.handL = handInWeapon(d.gripL, GRIP_HOLE_L);
    // weapon relative to right hand bone
    const inv = new THREE.Matrix4().compose(d.handR.pos, d.handR.quat, new V3(1, 1, 1)).invert();
    d.inHand = { pos: new V3(), quat: new THREE.Quaternion() };
    inv.decompose(d.inHand.pos, d.inHand.quat, new V3());
    // dual wield: a second instance of the same weapon sits in the LEFT fist — inHandL = that weapon in left-hand space
    // (d.handL = the left hand frame in its own weapon's space). Attach like the main one, under handL.
    if (d.dual) {
      const invL = new THREE.Matrix4().compose(d.handL.pos, d.handL.quat, new V3(1, 1, 1)).invert();
      d.inHandL = { pos: new V3(), quat: new THREE.Quaternion() };
      invL.decompose(d.inHandL.pos, d.inHandL.quat, new V3());
    }
    _cache.set(kind, d);
  }
  return _cache.get(kind);
}
