import type { Caption } from "@remotion/captions";
import { AbsoluteFill, Html5Audio, continueRender, delayRender, interpolate, staticFile, useVideoConfig } from "remotion";
import { Captions } from "../../Captions";
import captions from "../../../public/captions-aa-ka-ma-bai.json";
import { RiverScene } from "./RiverScene";
import { DipToBlack, HINDI, Overlays } from "./Overlays";
import { SCENES } from "./timeline";

// Load the bundled Devanagari font before any frame is captured.
const fontHandle = delayRender("Loading Noto Sans Devanagari");
const face = new FontFace("NotoDeva", `url(${staticFile("fonts/NotoSansDevanagari-800.woff2")}) format("woff2")`, {
  weight: "100 900",
});
face
  .load()
  .then((f) => {
    document.fonts.add(f);
    continueRender(fontHandle);
  })
  .catch((err) => {
    console.error(err);
    continueRender(fontHandle);
  });

export const AaKaMaBaiShort: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#03050d" }}>
      <RiverScene />
      <Overlays />
      <Captions
        captions={captions as Caption[]}
        combineMs={900}
        // the chant has its own lyric card; the outro has its own text
        hideRanges={[
          [SCENES.chant * 1000 - 100, SCENES.sail * 1000 - 100],
          [48400, 60000],
        ]}
        fontFamily={HINDI}
        fontSizeRatio={0.068}
        bottom={0.25}
        uppercase={false}
        highlight="#ffd27a"
      />
      <DipToBlack />

      <Html5Audio src={staticFile("voiceover/aa-ka-ma-bai-shorts.mp3")} volume={1} />
      <Html5Audio
        src={staticFile("music/drone.mp3")}
        volume={(f) =>
          interpolate(f, [0, fps * 2, durationInFrames - fps * 3, durationInFrames], [0, 0.16, 0.16, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
    </AbsoluteFill>
  );
};
