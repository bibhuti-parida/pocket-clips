import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SCENES } from "./timeline";

/**
 * Pre-dawn river on Kartika Purnima: full moon, lamp boats, a trading ship,
 * and an offering boat with betel leaf + areca nut.
 * Everything is a pure function of t = frame / fps (no clocks, no useFrame).
 */

// ---------- helpers ----------
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = Easing.inOut(Easing.cubic);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp3 = (a: number[], b: number[], k: number): [number, number, number] => [
  lerp(a[0], b[0], k),
  lerp(a[1], b[1], k),
  lerp(a[2], b[2], k),
];
const prog = (t: number, a: number, b: number) => ease(clamp01((t - a) / (b - a)));
const srgb = (hex: string) => {
  const c = parseInt(hex.slice(1), 16);
  return new THREE.Vector3(((c >> 16) & 255) / 255, ((c >> 8) & 255) / 255, (c & 255) / 255);
};
const mixV = (a: THREE.Vector3, b: THREE.Vector3, k: number) => a.clone().lerp(b, k);

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- camera per scene ----------
export const CLOSE_BOAT_Z = 6;

function cameraAt(t: number): { pos: [number, number, number]; look: [number, number, number] } {
  if (t < SCENES.chant) {
    const k = prog(t, 0, SCENES.chant);
    return { pos: lerp3([0, 0.5, 3.1], [0, 0.85, 2.5], k), look: [0, 0.05, -3] };
  }
  if (t < SCENES.sail) {
    const k = prog(t, SCENES.chant, SCENES.sail);
    return { pos: lerp3([0, 1.3, 4.5], [0, 2.1, 3.2], k), look: [0, 0, -11] };
  }
  if (t < SCENES.betel) {
    const k = prog(t, SCENES.sail, SCENES.betel);
    const shipX = shipXAt(t);
    return { pos: lerp3([-0.8, 0.9, 6], [0.8, 1.1, 5.2], k), look: [shipX * 0.55, 1.5, -20] };
  }
  if (t < SCENES.question) {
    const k = prog(t, SCENES.betel, SCENES.question);
    const a = lerp(-0.5, 0.35, k);
    const r = lerp(0.95, 0.75, k);
    return {
      pos: [Math.sin(a) * r, lerp(0.5, 0.38, k), CLOSE_BOAT_Z + Math.cos(a) * r],
      look: [0, 0.07, CLOSE_BOAT_Z],
    };
  }
  if (t < SCENES.outro) {
    const k = prog(t, SCENES.question, SCENES.outro);
    return { pos: lerp3([0, 2.6, 8.5], [0, 1.6, 4.5], k), look: [0, 0.2, -12] };
  }
  const k = prog(t, SCENES.outro, SCENES.outro + 5);
  return { pos: lerp3([0, 0.55, 8.6], [0, 0.75, 8.1], k), look: [0, 0.7, -40] };
}

const shipXAt = (t: number) => lerp(-5.5, 5.5, clamp01((t - SCENES.sail) / (SCENES.betel - SCENES.sail)));

// ---------- textures ----------
function useGlowTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(0.18, "rgba(255,255,255,0.55)");
    grd.addColorStop(0.5, "rgba(255,255,255,0.12)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

function useMoonTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    const halo = g.createRadialGradient(128, 128, 30, 128, 128, 128);
    halo.addColorStop(0, "rgba(220,230,255,0.45)");
    halo.addColorStop(1, "rgba(220,230,255,0)");
    g.fillStyle = halo;
    g.fillRect(0, 0, 256, 256);
    const disc = g.createRadialGradient(118, 118, 4, 128, 128, 34);
    disc.addColorStop(0, "#fffdf3");
    disc.addColorStop(0.85, "#f1ecd8");
    disc.addColorStop(1, "rgba(241,236,216,0)");
    g.fillStyle = disc;
    g.beginPath();
    g.arc(128, 128, 34, 0, Math.PI * 2);
    g.fill();
    // a few soft maria
    g.fillStyle = "rgba(170,165,150,0.25)";
    for (const [x, y, r] of [
      [116, 120, 9],
      [136, 136, 7],
      [126, 104, 5],
      [142, 118, 4],
    ]) {
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

// ---------- geometry ----------
function lensShape(L: number, W: number) {
  const s = new THREE.Shape();
  s.moveTo(-L, 0);
  s.quadraticCurveTo(0, W * 2, L, 0);
  s.quadraticCurveTo(0, -W * 2, -L, 0);
  return s;
}

function hullGeometry(L: number, W: number, depth: number, bevel: number) {
  const g = new THREE.ExtrudeGeometry(lensShape(L, W), {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 24,
  });
  g.rotateX(-Math.PI / 2); // extrude upward (+y)
  return g;
}

function betelLeafGeometry() {
  const s = new THREE.Shape();
  s.moveTo(0, -0.35);
  s.bezierCurveTo(0.25, -0.6, 0.72, -0.4, 0.6, 0.05);
  s.bezierCurveTo(0.5, 0.5, 0.15, 0.75, 0, 1.05);
  s.bezierCurveTo(-0.15, 0.75, -0.5, 0.5, -0.6, 0.05);
  s.bezierCurveTo(-0.72, -0.4, -0.25, -0.6, 0, -0.35);
  const g = new THREE.ExtrudeGeometry(s, {
    depth: 0.02,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.02,
    bevelSegments: 2,
    curveSegments: 24,
  });
  g.rotateX(-Math.PI / 2);
  return g;
}

const HULL_TOP = 0.075;

function useAssets() {
  const glow = useGlowTexture();
  const moon = useMoonTexture();
  return useMemo(() => {
    return {
      glow,
      moon,
      hull: hullGeometry(0.32, 0.1, 0.05, 0.015),
      shipHull: hullGeometry(2.6, 0.55, 0.55, 0.08),
      diya: new THREE.CylinderGeometry(0.05, 0.032, 0.035, 20),
      flame: (() => {
        const g = new THREE.ConeGeometry(0.016, 0.06, 12);
        g.translate(0, 0.03, 0);
        return g;
      })(),
      leaf: betelLeafGeometry(),
      hullMat: new THREE.MeshStandardMaterial({ color: "#b89559", roughness: 0.85 }),
      shipMat: new THREE.MeshStandardMaterial({ color: "#3b281a", roughness: 0.9 }),
      sailMat: new THREE.MeshStandardMaterial({ color: "#e4d6b5", roughness: 1, side: THREE.DoubleSide }),
      diyaMat: new THREE.MeshStandardMaterial({ color: "#a4532c", roughness: 0.8 }),
      flameMat: new THREE.MeshBasicMaterial({ color: "#ffd27a" }),
      leafMat: new THREE.MeshStandardMaterial({ color: "#3e8f37", roughness: 0.35, metalness: 0.05 }),
      nutMat: new THREE.MeshStandardMaterial({ color: "#7b4a24", roughness: 0.7 }),
      glowMat: new THREE.SpriteMaterial({
        map: glow,
        color: "#ffae4d",
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
      }),
      reflMat: new THREE.MeshBasicMaterial({
        map: glow,
        color: "#ff9a3d",
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.55,
      }),
    };
  }, [glow, moon]);
}
type Assets = ReturnType<typeof useAssets>;

// ---------- sky + water shaders ----------
const skyVert = /* glsl */ `
varying vec3 vDir;
void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const skyFrag = /* glsl */ `
uniform vec3 uZenith; uniform vec3 uHorizon; uniform vec3 uGlowCol; uniform float uGlow; uniform float uStars;
varying vec3 vDir;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
void main(){
  vec3 d = normalize(vDir);
  float h = clamp(d.y, 0.0, 1.0);
  vec3 c = mix(uHorizon, uZenith, pow(h, 0.45));
  float g = pow(max(dot(d, normalize(vec3(0.35, 0.03, -1.0))), 0.0), 6.0);
  c += uGlowCol * g * uGlow;
  vec2 cell = floor(vec2(atan(d.x, d.z) * 260.0, d.y * 420.0));
  float s = step(0.9975, hash(cell)) * smoothstep(0.08, 0.4, h) * uStars;
  c += vec3(s * 0.8);
  gl_FragColor = vec4(c, 1.0);
}`;

const waterVert = /* glsl */ `
varying vec3 vW;
void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
const waterFrag = /* glsl */ `
uniform float uTime; uniform vec3 uDeep; uniform vec3 uHorizon; uniform vec3 uCam; uniform float uMoonX;
uniform vec3 uGlowCol; uniform float uGlow;
varying vec3 vW;
void main(){
  vec2 p = vW.xz;
  float n = sin(p.x*2.7 + uTime*0.9) * sin(p.y*3.1 - uTime*0.7) * 0.5
          + sin((p.x*1.3 - p.y*2.2)*2.0 + uTime*1.4) * 0.3
          + sin(p.y*9.0 + p.x*1.7 - uTime*2.0) * 0.2;
  float dist = length(vW.xz - uCam.xz);
  vec3 col = uDeep * (0.85 + 0.22*n);
  float along = clamp((uCam.z - p.y) / 120.0, 0.0, 1.0);
  float lineX = mix(uCam.x, uMoonX, along);
  float width = 0.25 + along * 6.0;
  float streak = exp(-abs(p.x - lineX) / width) * smoothstep(-0.2, 0.6, n) * smoothstep(1.5, 12.0, dist);
  col += vec3(0.55, 0.62, 0.8) * streak * 0.45;
  col += uGlowCol * uGlow * smoothstep(20.0, 140.0, dist) * smoothstep(-0.5, 0.8, n) * 0.5;
  col = mix(col, uHorizon, smoothstep(30.0, 160.0, dist));
  gl_FragColor = vec4(col, 1.0);
}`;

const NIGHT = { zenith: srgb("#03050d"), horizon: srgb("#1a2848"), deep: srgb("#0a1426") };
const DAWN = { zenith: srgb("#17224a"), horizon: srgb("#b86d55"), deep: srgb("#1a2238") };
const GLOW = srgb("#ff9e5e");
const MOON_POS: [number, number, number] = [-22, 24, -110];

const SkyAndWater: React.FC<{ t: number; dawn: number; cam: [number, number, number] }> = ({ t, dawn, cam }) => {
  const skyU = useMemo(
    () => ({
      uZenith: { value: NIGHT.zenith.clone() },
      uHorizon: { value: NIGHT.horizon.clone() },
      uGlowCol: { value: GLOW.clone() },
      uGlow: { value: 0 },
      uStars: { value: 1 },
    }),
    [],
  );
  const waterU = useMemo(
    () => ({
      uTime: { value: 0 },
      uDeep: { value: NIGHT.deep.clone() },
      uHorizon: { value: NIGHT.horizon.clone() },
      uCam: { value: new THREE.Vector3() },
      uMoonX: { value: MOON_POS[0] },
      uGlowCol: { value: GLOW.clone() },
      uGlow: { value: 0 },
    }),
    [],
  );
  skyU.uZenith.value.copy(mixV(NIGHT.zenith, DAWN.zenith, dawn));
  skyU.uHorizon.value.copy(mixV(NIGHT.horizon, DAWN.horizon, dawn));
  skyU.uGlow.value = 0.15 + dawn * 0.9;
  skyU.uStars.value = 1 - dawn;
  waterU.uTime.value = t;
  waterU.uDeep.value.copy(mixV(NIGHT.deep, DAWN.deep, dawn));
  waterU.uHorizon.value.copy(mixV(NIGHT.horizon, DAWN.horizon, dawn));
  waterU.uCam.value.set(...cam);
  waterU.uGlow.value = 0.1 + dawn * 0.9;

  return (
    <>
      <mesh>
        <sphereGeometry args={[200, 48, 24]} />
        <shaderMaterial vertexShader={skyVert} fragmentShader={skyFrag} uniforms={skyU} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[380, 380, 1, 1]} />
        <shaderMaterial vertexShader={waterVert} fragmentShader={waterFrag} uniforms={waterU} />
      </mesh>
    </>
  );
};

// ---------- boats ----------
const flicker = (t: number, phase: number) => 1 + 0.14 * Math.sin(t * 13 + phase) * Math.sin(t * 5.3 + phase * 1.7);

const LampBoat: React.FC<{
  a: Assets;
  t: number;
  x: number;
  z: number;
  rotY: number;
  phase: number;
  scale?: number;
  offering?: boolean;
  light?: boolean;
}> = ({ a, t, x, z, rotY, phase, scale = 1, offering, light }) => {
  const f = flicker(t, phase);
  const bob = Math.sin(t * 1.6 + phase) * 0.01;
  if (scale <= 0.001) return null;
  return (
    <>
      <group
        position={[x, -0.02 + bob, z]}
        rotation={[Math.sin(t * 1.1 + phase) * 0.035, rotY, Math.sin(t * 1.3 + phase) * 0.035]}
        scale={scale}
      >
        <mesh geometry={a.hull} material={a.hullMat} />
        <mesh position={[0, HULL_TOP + 0.017, 0]} geometry={a.diya} material={a.diyaMat} />
        <mesh position={[0, HULL_TOP + 0.034, 0]} scale={[1, f, 1]} geometry={a.flame} material={a.flameMat} />
        <sprite position={[0, HULL_TOP + 0.07, 0]} scale={[0.5 * f, 0.5 * f, 1]} material={a.glowMat} />
        {offering ? (
          <>
            <mesh
              geometry={a.leaf}
              material={a.leafMat}
              position={[0.15, HULL_TOP + 0.004, 0.0]}
              rotation={[0.08, -0.6, 0.05]}
              scale={0.105}
            />
            <mesh position={[0.155, HULL_TOP + 0.03, -0.005]} rotation={[0, -0.6, 0]} scale={[0.004, 0.004, 0.09]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#7fc06a" roughness={0.6} />
            </mesh>
            <mesh position={[-0.14, HULL_TOP + 0.025, 0.015]} scale={[1, 0.8, 1]} material={a.nutMat}>
              <sphereGeometry args={[0.03, 24, 16]} />
            </mesh>
            <mesh position={[-0.19, HULL_TOP + 0.022, -0.02]} scale={[1, 0.8, 1]} material={a.nutMat}>
              <sphereGeometry args={[0.026, 24, 16]} />
            </mesh>
          </>
        ) : null}
        {light ? (
          <pointLight position={[0, HULL_TOP + 0.09, 0]} color="#ffb066" intensity={0.35 * f} distance={2} decay={2} />
        ) : null}
      </group>
      <mesh
        position={[x, 0.004, z + 0.55 * scale]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[0.22 * scale * f, 1.3 * scale, 1]}
        material={a.reflMat}
      >
        <planeGeometry args={[1, 1]} />
      </mesh>
    </>
  );
};

const Ship: React.FC<{ a: Assets; t: number }> = ({ a, t }) => {
  const x = shipXAt(t);
  const roll = Math.sin(t * 0.9) * 0.03;
  const f = flicker(t, 2);
  return (
    <group position={[x, -0.15, -18]} rotation={[0, 0, roll]}>
      <mesh geometry={a.shipHull} material={a.shipMat} />
      {/* main mast + sail */}
      <mesh position={[0.2, 2.1, 0]} material={a.shipMat}>
        <cylinderGeometry args={[0.05, 0.07, 3.4, 10]} />
      </mesh>
      <mesh position={[0.25, 2.25, 0.08]} rotation={[0, -0.25, 0]} material={a.sailMat}>
        <planeGeometry args={[2.2, 2.3, 1, 1]} />
      </mesh>
      {/* fore sail */}
      <mesh position={[1.8, 1.4, 0.05]} rotation={[0, -0.25, 0]} material={a.sailMat}>
        <planeGeometry args={[0.9, 1.1, 1, 1]} />
      </mesh>
      <mesh position={[1.75, 1.2, 0]} material={a.shipMat}>
        <cylinderGeometry args={[0.03, 0.04, 1.8, 8]} />
      </mesh>
      {/* stern lantern */}
      <sprite position={[-2.2, 1.0, 0]} scale={[1.6 * f, 1.6 * f, 1]} material={a.glowMat} />
    </group>
  );
};

// ---------- the whole world ----------
type FieldBoat = { x: number; z: number; rotY: number; phase: number; spawn: number; speed: number };

/** `atSeconds` renders a fixed moment (used for thumbnails); otherwise follows the timeline. */
export const RiverScene: React.FC<{ atSeconds?: number }> = ({ atSeconds }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const t = atSeconds ?? frame / fps;
  const a = useAssets();

  const field: FieldBoat[] = useMemo(() => {
    const r = mulberry32(7);
    return Array.from({ length: 46 }, () => {
      const z = -1.5 - r() * 30;
      const spread = 1.6 + (-z / 30) * 9;
      return {
        x: (r() - 0.5) * spread,
        z,
        rotY: (r() - 0.5) * 1.2,
        phase: r() * 10,
        spawn: 2.9 + r() * 3.2,
        speed: 0.05 + r() * 0.06,
      };
    });
  }, []);

  const cam = cameraAt(t);
  const dawn = interpolate(t, [SCENES.outro - 1, SCENES.outro + 4.5], [0, 0.75], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // hero boat: pushed out from the camera at the start
  const heroZ = lerp(1.25, -2.6, prog(t, 0.2, 6.5)) - Math.max(0, t - 6.5) * 0.05;
  // offering boat for the close-up, then the "last boat" drifting to dawn
  const closeZ = t < SCENES.outro ? CLOSE_BOAT_Z : lerp(CLOSE_BOAT_Z, -4, prog(t, SCENES.outro, SCENES.outro + 5.2));
  const showClose = t >= SCENES.betel && t < SCENES.question ? true : t >= SCENES.outro;

  return (
    <ThreeCanvas width={width} height={height} camera={{ fov: 50, near: 0.03, far: 450, position: cam.pos }}>
      <CameraRig pos={cam.pos} look={cam.look} />
      <SkyAndWater t={t} dawn={dawn} cam={cam.pos} />
      <sprite position={MOON_POS} scale={[30, 30, 1]}>
        <spriteMaterial map={a.moon} transparent depthWrite={false} opacity={1 - dawn * 0.6} />
      </sprite>

      <ambientLight intensity={0.35 + dawn * 0.4} color="#8fa6d8" />
      <hemisphereLight args={["#3a4f86", "#05070f", 0.6]} />
      <directionalLight position={[-22, 24, -40]} intensity={0.9} color="#c4d4ff" />
      <directionalLight position={[20, 6, -60]} intensity={dawn * 1.4} color="#ffb27a" />

      <LampBoat a={a} t={t} x={0} z={heroZ} rotY={0.15} phase={1.3} offering scale={1} />

      {field.map((b, i) => {
        const appear = interpolate(t, [b.spawn, b.spawn + 0.8], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.back(1.6)),
        });
        const z = b.z - Math.max(0, t - b.spawn) * b.speed;
        const x = b.x + Math.sin(t * 0.2 + b.phase) * 0.15;
        return <LampBoat key={i} a={a} t={t} x={x} z={z} rotY={b.rotY} phase={b.phase} scale={appear} />;
      })}

      {t >= SCENES.sail && t < SCENES.betel ? <Ship a={a} t={t} /> : null}

      {showClose ? (
        <LampBoat a={a} t={t} x={0} z={closeZ} rotY={-0.25} phase={4.2} offering light scale={1} />
      ) : null}
    </ThreeCanvas>
  );
};

const CameraRig: React.FC<{ pos: [number, number, number]; look: [number, number, number] }> = ({ pos, look }) => {
  const camera = useThree((s) => s.camera);
  useLayoutEffect(() => {
    camera.position.set(...pos);
    camera.lookAt(...look);
    camera.updateProjectionMatrix();
  }, [camera, pos, look]);
  return null;
};
