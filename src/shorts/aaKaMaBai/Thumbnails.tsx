import { AbsoluteFill } from "remotion";
import "../../fonts";
import { RiverScene } from "./RiverScene";
import { HINDI } from "./Overlays";

/**
 * Thumbnails built from frozen frames of the actual 3D scene.
 *   AaKaMaBaiCover      1080x1920  Shorts cover
 *   AaKaMaBaiThumbBoat  1280x720   offering-boat close-up + question
 *   AaKaMaBaiThumbMoon  1280x720   lamp field + giant "?"
 */
const AT_LAMP_FIELD = 40; // seconds: wide shot, moon + lamp boats
const AT_OFFERING = 24.5; // seconds: close-up, diya + betel leaf + areca nut

const GOLD = "#ffd27a";
const CREAM = "#fff3d6";

const glow = (color: string, strength = 1) =>
  [
    `0 0 ${18 * strength}px ${color}cc`,
    `0 0 ${50 * strength}px ${color}88`,
    "0 8px 0 rgba(0,0,0,0.55)",
    "0 12px 40px rgba(0,0,0,0.8)",
  ].join(", ");

const bigText = (size: number, color = CREAM, stroke = 0.06): React.CSSProperties => ({
  fontFamily: HINDI,
  fontWeight: 900,
  fontSize: size,
  lineHeight: 1.15,
  color,
  WebkitTextStroke: `${Math.round(size * stroke)}px rgba(8,6,2,0.9)`,
  paintOrder: "stroke",
  textShadow: glow(color === CREAM ? GOLD : color),
  whiteSpace: "nowrap",
});

const Scene: React.FC<{ at: number; style?: React.CSSProperties }> = ({ at, style }) => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <AbsoluteFill style={style}>
      <RiverScene atSeconds={at} />
    </AbsoluteFill>
  </AbsoluteFill>
);

const Pill: React.FC<{ children: React.ReactNode; size: number; filled?: boolean }> = ({ children, size, filled }) => (
  <div
    style={{
      fontFamily: HINDI,
      fontWeight: 800,
      fontSize: size,
      lineHeight: 1.3,
      color: filled ? "#1a1206" : CREAM,
      background: filled ? GOLD : "rgba(8,12,28,0.7)",
      border: filled ? "none" : `3px solid ${GOLD}aa`,
      padding: `${size * 0.22}px ${size * 0.6}px`,
      borderRadius: 999,
      whiteSpace: "nowrap",
      boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
    }}
  >
    {children}
  </div>
);

// ---------- 1) Shorts cover, 1080x1920 ----------
export const AaKaMaBaiCover: React.FC = () => (
  <AbsoluteFill style={{ background: "#03050d" }}>
    <Scene at={AT_LAMP_FIELD} />
    <AbsoluteFill
      style={{ background: "linear-gradient(to bottom, rgba(2,4,14,0.55), rgba(2,4,14,0.1) 45%, rgba(2,4,14,0.5))" }}
    />
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 330, gap: 10 }}>
      <Pill size={50}>ओडिशा की एक पहेली</Pill>
      <div style={{ ...bigText(220), marginTop: 40 }}>आ का मा बै</div>
      <div style={{ ...bigText(360, GOLD, 0.05), marginTop: -20 }}>= ?</div>
      <div style={{ marginTop: 30 }}>
        <Pill size={56} filled>
          4 अक्षर · कोई पक्का जवाब नहीं
        </Pill>
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);

// ---------- 2) Landscape: offering boat + question ----------
export const AaKaMaBaiThumbBoat: React.FC = () => (
  <AbsoluteFill style={{ background: "#03050d" }}>
    {/* push the boat to the right half */}
    <Scene at={AT_OFFERING} style={{ transform: "translate(27%, 8%) scale(1.2)" }} />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(to right, rgba(2,4,14,0.92) 0%, rgba(2,4,14,0.75) 38%, rgba(2,4,14,0) 62%), linear-gradient(to top, rgba(2,4,14,0.6), rgba(2,4,14,0) 30%)",
      }}
    />
    <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 70, gap: 6 }}>
      <div style={{ ...bigText(150) }}>आ का मा बै</div>
      <div style={{ ...bigText(150, GOLD, 0.05) }}>का मतलब?</div>
      <div style={{ marginTop: 26, display: "flex" }}>
        <Pill size={40} filled>
          आज तक तय नहीं!
        </Pill>
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);

// ---------- 3) Landscape: lamp field + giant "?" ----------
export const AaKaMaBaiThumbMoon: React.FC = () => (
  <AbsoluteFill style={{ background: "#03050d" }}>
    <Scene at={AT_LAMP_FIELD} />
    <AbsoluteFill
      style={{ background: "linear-gradient(to right, rgba(2,4,14,0.85) 0%, rgba(2,4,14,0.55) 45%, rgba(2,4,14,0.1) 75%)" }}
    />
    <div
      style={{
        position: "absolute",
        right: 70,
        top: -40,
        ...bigText(640, GOLD, 0.035),
        transform: "rotate(8deg)",
      }}
    >
      ?
    </div>
    <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 70, gap: 18 }}>
      <div style={{ display: "flex" }}>
        <Pill size={38}>कार्तिक पूर्णिमा · बोइत बंदाण</Pill>
      </div>
      <div style={{ ...bigText(170) }}>आ का मा बै</div>
      <div style={{ ...bigText(78, CREAM, 0.07), textShadow: "0 6px 24px rgba(0,0,0,0.9)" }}>
        ओडिशा की अनसुलझी पहेली
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);
