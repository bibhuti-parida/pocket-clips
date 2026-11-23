import { AbsoluteFill, Html5Audio, interpolate, staticFile, useVideoConfig } from "remotion";
import { Scene3D } from "./Scene3D";
import { Captions } from "./Captions";

export const Main3D: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0d17" }}>
      {/* Layer 1: Three.js scene */}
      <Scene3D />

      {/* Layer 2: captions (plain HTML/CSS on top of the canvas) */}
      <Captions />

      {/* Layer 3: audio. Replace public/music.mp3 with your own track or voiceover. */}
      <Html5Audio
        src={staticFile("music.mp3")}
        volume={(f) =>
          interpolate(f, [0, fps, durationInFrames - fps, durationInFrames], [0, 0.8, 0.8, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
    </AbsoluteFill>
  );
};
