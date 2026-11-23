import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * RULE: drive every animation from useCurrentFrame(), never from R3F's
 * useFrame() or a clock. Remotion renders frames out of order and in
 * parallel, so each frame must be a pure function of the frame number.
 */
export const Scene3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps, durationInFrames } = useVideoConfig();

  // Hero object pops in with a spring
  const entrance = spring({ frame, fps, config: { damping: 12, mass: 0.8 } });

  // Slow camera orbit + dolly-in during the last third
  const angle = interpolate(frame, [0, durationInFrames], [0, Math.PI * 0.6]);
  const baseRadius = width > height ? 6 : 9; // pull back for vertical format
  const dolly = interpolate(frame, [durationInFrames * 0.66, durationInFrames], [1, 0.8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const r = baseRadius * dolly;
  const camPos: [number, number, number] = [Math.sin(angle) * r, 1.5, Math.cos(angle) * r];

  const rot = frame * 0.02;
  const pulse = 1 + Math.sin(frame / 8) * 0.04;

  return (
    <ThreeCanvas width={width} height={height} camera={{ fov: 50, position: camPos }}>
      <CameraRig position={camPos} />
      <color attach="background" args={["#0b0d17"]} />
      <fog attach="fog" args={["#0b0d17", 8, 20]} />

      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={2.5} />
      <pointLight position={[-4, 2, -2]} intensity={40} color="#5b8cff" />
      <pointLight position={[4, -1, 3]} intensity={30} color="#ff5bb0" />

      {/* Hero object */}
      <mesh scale={entrance * 1.3 * pulse} rotation={[rot, rot * 0.7, 0]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshPhysicalMaterial
          color="#7c5cff"
          roughness={0.2}
          metalness={0.3}
          clearcoat={1}
          flatShading
        />
      </mesh>

      {/* Orbiting satellites, staggered entrance */}
      {SATELLITE_COLORS.map((color, i) => {
        const s = spring({ frame: frame - (10 + i * 6), fps, config: { damping: 14 } });
        const a = (i / SATELLITE_COLORS.length) * Math.PI * 2 + frame * 0.03;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 2.6, Math.sin(a * 2) * 0.4, Math.sin(a) * 2.6]}
            rotation={[frame * 0.05, frame * 0.04, 0]}
            scale={s * 0.35}
          >
            <torusKnotGeometry args={[0.6, 0.2, 128, 16]} />
            <meshStandardMaterial color={color} metalness={0.4} roughness={0.25} />
          </mesh>
        );
      })}

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.8, 0]}>
        <circleGeometry args={[10, 64]} />
        <meshStandardMaterial color="#161a2e" roughness={0.9} />
      </mesh>
    </ThreeCanvas>
  );
};

const SATELLITE_COLORS = ["#ff5bb0", "#5bd1ff", "#ffd25b", "#5bff9c", "#ff8a5b"];

/** Moves the camera each frame and keeps it aimed at the origin. */
const CameraRig: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const camera = useThree((s) => s.camera);
  const [x, y, z] = position;
  useLayoutEffect(() => {
    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, x, y, z]);
  return null;
};
