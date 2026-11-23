import { Composition, Still } from "remotion";
import { Main3D } from "./Main3D";
import { AaKaMaBaiShort } from "./shorts/aaKaMaBai/AaKaMaBaiShort";
import { DURATION_S } from "./shorts/aaKaMaBai/timeline";
import { AaKaMaBaiCover, AaKaMaBaiThumbBoat, AaKaMaBaiThumbMoon } from "./shorts/aaKaMaBai/Thumbnails";

export const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Landscape 1080p */}
      <Composition
        id="Main3D"
        component={Main3D}
        durationInFrames={FPS * 10}
        fps={FPS}
        width={1920}
        height={1080}
      />
      {/* Vertical 9:16 for Shorts / Reels / TikTok */}
      <Composition
        id="Main3DVertical"
        component={Main3D}
        durationInFrames={FPS * 10}
        fps={FPS}
        width={1080}
        height={1920}
      />
      {/* Shorts: "आ का मा बै" chant mystery (Hindi, 9:16) */}
      <Composition
        id="AaKaMaBaiShort"
        component={AaKaMaBaiShort}
        durationInFrames={FPS * DURATION_S}
        fps={FPS}
        width={1080}
        height={1920}
      />
      {/* Thumbnails for the Short */}
      <Still id="AaKaMaBaiCover" component={AaKaMaBaiCover} width={1080} height={1920} />
      <Still id="AaKaMaBaiThumbBoat" component={AaKaMaBaiThumbBoat} width={1280} height={720} />
      <Still id="AaKaMaBaiThumbMoon" component={AaKaMaBaiThumbMoon} width={1280} height={720} />
    </>
  );
};
