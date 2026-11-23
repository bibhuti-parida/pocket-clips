import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CHANT_LINES, CUTS, DURATION_S, LETTERS, SCENES, T } from "./timeline";

export const HINDI = "NotoDeva, 'FreeSans', sans-serif";
const GOLD = "#ffd27a";
const clampOpts = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0→1 fade-in at `a`, 1→0 fade-out ending at `b` */
const window01 = (t: number, a: number, b: number, fade = 0.35) =>
  Math.min(interpolate(t, [a, a + fade], [0, 1], clampOpts), interpolate(t, [b - fade, b], [1, 0], clampOpts));

const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { t: frame / fps, frame, fps };
};

const pop = (frame: number, fps: number, atS: number) =>
  spring({ frame: frame - Math.round(atS * fps), fps, config: { damping: 11, mass: 0.6 } });

const glowText = (color = GOLD) =>
  `0 0 18px ${color}cc, 0 0 48px ${color}88, 0 6px 22px rgba(0,0,0,0.7)`;

// ---------- small building blocks ----------
const Chip: React.FC<{ text: string; from: number; to: number; top?: number }> = ({ text, from, to, top = 210 }) => {
  const { t } = useT();
  const o = window01(t, from, to);
  if (o <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity: o,
        transform: `translateY(${(1 - o) * -16}px)`,
      }}
    >
      <div
        style={{
          fontFamily: HINDI,
          fontWeight: 800,
          fontSize: 46,
          color: "#fff6e2",
          padding: "14px 34px",
          borderRadius: 999,
          background: "rgba(10,16,34,0.55)",
          border: `2px solid ${GOLD}88`,
          backdropFilter: "blur(6px)",
          letterSpacing: 0.5,
        }}
      >
        {text}
      </div>
    </div>
  );
};

// ---------- chant lyric card ----------
const ChantCard: React.FC = () => {
  const { t } = useT();
  const o = window01(t, SCENES.chant - 0.1, SCENES.sail - 0.15, 0.4);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: o, paddingBottom: 260 }}>
      <div style={{ textAlign: "center", fontFamily: HINDI, fontWeight: 800, lineHeight: 1.45 }}>
        {CHANT_LINES.map((line, li) => {
          const lineIn = interpolate(t, [line[0].t - 0.15, line[0].t + 0.25], [0, 1], clampOpts);
          return (
            <div
              key={li}
              style={{
                fontSize: li === 0 ? 118 : 92,
                opacity: lineIn,
                transform: `translateY(${(1 - lineIn) * 30}px)`,
                color: "#fff",
              }}
            >
              {line.map((w, wi) => {
                const next = line[wi + 1]?.t ?? CHANT_LINES[li + 1]?.[0].t ?? 13;
                const active = t >= w.t && t < next;
                const sung = t >= w.t;
                return (
                  <span
                    key={wi}
                    style={{
                      color: active ? GOLD : sung ? "#fff" : "rgba(255,255,255,0.35)",
                      textShadow: active ? glowText() : "0 6px 22px rgba(0,0,0,0.7)",
                      marginRight: 22,
                    }}
                  >
                    {w.text}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- route map: Kalinga → Java / Bali ----------
const RouteMap: React.FC = () => {
  const { t, frame, fps } = useT();
  const o = window01(t, T.kalinga - 0.4, SCENES.betel - 0.15);
  if (o <= 0) return null;
  const draw = interpolate(t, [T.kalinga, T.java + 0.4], [0, 1], { ...clampOpts, easing: Easing.inOut(Easing.cubic) });
  const path = "M 170 120 C 330 150, 520 260, 690 400 S 820 460, 860 440";
  const len = 900;
  const dot = (x: number, y: number, label: string, at: number, dx = 0, dy = -38, anchor = "middle") => {
    const s = pop(frame, fps, at);
    return (
      <g opacity={Math.min(1, s)}>
        <circle cx={x} cy={y} r={14 * s} fill={GOLD} />
        <circle cx={x} cy={y} r={30 * s} fill={GOLD} opacity={0.25} />
        <text
          x={x + dx}
          y={y + dy}
          textAnchor={anchor as "middle"}
          fontFamily={HINDI}
          fontWeight={800}
          fontSize={50}
          fill="#fff6e2"
          style={{ paintOrder: "stroke" }}
          stroke="rgba(0,0,0,0.6)"
          strokeWidth={8}
        >
          {label}
        </text>
      </g>
    );
  };
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <svg width={1080} height={620} viewBox="0 0 1080 620" style={{ position: "absolute", top: 300 }}>
        <path d={path} fill="none" stroke={GOLD} strokeWidth={7} strokeLinecap="round" strokeDasharray="2 18" opacity={0.35} />
        <path
          d={path}
          fill="none"
          stroke={GOLD}
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={len}
          strokeDashoffset={len * (1 - draw)}
          style={{ filter: `drop-shadow(0 0 10px ${GOLD})` }}
        />
        {dot(170, 120, "कलिंग", T.kalinga)}
        {dot(690, 400, "जावा", T.java, -10, 70)}
        {dot(860, 440, "बाली", T.bali + 0.9, 20, 75)}
      </svg>
    </AbsoluteFill>
  );
};

// ---------- the four mystery syllables ----------
const LETTER_Y = 560;
const CELL = 240;

const Letters: React.FC = () => {
  const { t, frame, fps } = useT();
  const o = window01(t, LETTERS[0].t - 0.2, SCENES.outro + 1.6, 0.5);
  if (o <= 0) return null;

  // blur into one "?" after "अर्थ धुंधला है"
  const merge = interpolate(t, [T.blur, T.awaaz + 0.2], [0, 1], { ...clampOpts, easing: Easing.inOut(Easing.cubic) });
  const doubt = interpolate(t, [T.debate, T.debate + 0.6], [0, 1], clampOpts);
  const guessing = t >= T.ruko && t < T.guessEnd;

  return (
    <AbsoluteFill style={{ opacity: o }}>
      {LETTERS.map((L, i) => {
        const s = pop(frame, fps, L.t);
        const cx = 540 + (i - 1.5) * CELL;
        const float = Math.sin(t * 2 + i * 1.3) * (guessing ? 14 : 6);
        const spin = guessing ? Math.sin(t * 2.4 + i) * 18 : 0;
        const x = cx + (540 - cx) * merge;
        const monthS = pop(frame, fps, L.monthT);
        const isActiveMonth = t >= L.monthT && t < (LETTERS[i + 1]?.monthT ?? T.debate);
        const wobble = doubt * Math.sin(t * 9 + i * 2) * 4;
        return (
          <div key={i}>
            <div
              style={{
                position: "absolute",
                left: x - CELL / 2,
                top: LETTER_Y - 130 + float,
                width: CELL,
                textAlign: "center",
                fontFamily: HINDI,
                fontWeight: 900,
                fontSize: 190,
                lineHeight: 1.2,
                color: "#fff3d6",
                textShadow: glowText(),
                transform: `scale(${s * (1 - merge * 0.4)}) rotateY(${spin}deg)`,
                opacity: Math.min(1, s) * (1 - merge),
                filter: `blur(${merge * 14}px)`,
              }}
            >
              {L.letter}
            </div>
            {/* month label */}
            <div
              style={{
                position: "absolute",
                left: cx - CELL / 2 - 10,
                top: LETTER_Y + 150 + wobble,
                width: CELL + 20,
                textAlign: "center",
                fontFamily: HINDI,
                fontWeight: 800,
                fontSize: 46,
                color: isActiveMonth ? GOLD : "#fff6e2",
                opacity: Math.min(1, monthS) * (1 - doubt * 0.55) * (1 - merge),
                transform: `translateY(${(1 - Math.min(1, monthS)) * 24}px)`,
                textShadow: "0 4px 14px rgba(0,0,0,0.8)",
              }}
            >
              <div style={{ width: 4, height: 40 * monthS, background: `${GOLD}aa`, margin: "0 auto 10px" }} />
              {L.month}
              {doubt > 0 ? <span style={{ color: GOLD, opacity: doubt }}> ?</span> : null}
            </div>
          </div>
        );
      })}

      {/* the single big question mark */}
      {merge > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: LETTER_Y - 230,
            textAlign: "center",
            fontFamily: HINDI,
            fontWeight: 900,
            fontSize: 380,
            color: "#fff3d6",
            textShadow: glowText(),
            opacity: merge * interpolate(t, [SCENES.outro + 1.1, SCENES.outro + 1.6], [1, 0], clampOpts),
            transform: `scale(${0.6 + merge * 0.4 + Math.sin(t * 2) * 0.02})`,
          }}
        >
          ?
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------- 3-2-1 guess countdown ----------
const Countdown: React.FC = () => {
  const { t } = useT();
  if (t < T.ruko || t >= T.guessEnd) return null;
  const span = (T.guessEnd - T.ruko) / 3;
  const idx = Math.min(2, Math.floor((t - T.ruko) / span));
  const local = (t - T.ruko - idx * span) / span;
  const n = 3 - idx;
  const scale = interpolate(local, [0, 0.2, 1], [1.5, 1, 0.92], clampOpts);
  const op = interpolate(local, [0, 0.12, 0.85, 1], [0, 1, 1, 0.2], clampOpts);
  const ring = 1 - local;
  return (
    <AbsoluteFill style={{ alignItems: "center", top: 860, justifyContent: "flex-start" }}>
      <div style={{ position: "relative", width: 230, height: 230, opacity: op, transform: `scale(${scale})` }}>
        <svg width={230} height={230} style={{ position: "absolute", inset: 0 }}>
          <circle cx={115} cy={115} r={100} stroke="rgba(255,255,255,0.18)" strokeWidth={10} fill="rgba(10,16,34,0.5)" />
          <circle
            cx={115}
            cy={115}
            r={100}
            stroke={GOLD}
            strokeWidth={10}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={628}
            strokeDashoffset={628 * (1 - ring)}
            transform="rotate(-90 115 115)"
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'FreeSans', sans-serif",
            fontWeight: 900,
            fontSize: 130,
            color: GOLD,
            textShadow: glowText(),
          }}
        >
          {n}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- betel scene word tags ----------
const OfferingTags: React.FC = () => {
  const { t, frame, fps } = useT();
  const o = window01(t, T.paan - 0.2, SCENES.question - 0.15);
  if (o <= 0) return null;
  const tag = (main: string, sub: string, at: number) => {
    const s = Math.min(1, pop(frame, fps, at));
    return (
      <div
        style={{
          transform: `scale(${s})`,
          opacity: s,
          textAlign: "center",
          fontFamily: HINDI,
          padding: "16px 34px",
          borderRadius: 28,
          background: "rgba(10,16,34,0.55)",
          border: `2px solid ${GOLD}88`,
        }}
      >
        <div style={{ fontSize: 66, fontWeight: 900, color: GOLD, lineHeight: 1.2 }}>{main}</div>
        <div style={{ fontSize: 38, fontWeight: 800, color: "#fff6e2", lineHeight: 1.3 }}>{sub}</div>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{ opacity: o, flexDirection: "row", justifyContent: "center", alignItems: "flex-start", gap: 40, top: 300 }}>
      {tag("पान", "पान का पत्ता", T.paan)}
      {tag("गुआ", "सुपारी", T.paan + 0.35)}
    </AbsoluteFill>
  );
};

// ---------- outro ----------
const OutroText: React.FC = () => {
  const { t, frame, fps } = useT();
  if (t < T.answer - 0.1) return null;
  const s = pop(frame, fps, T.answer);
  const s2 = pop(frame, fps, T.comment);
  return (
    <AbsoluteFill style={{ alignItems: "center", top: 470, fontFamily: HINDI, textAlign: "center" }}>
      <div style={{ fontSize: 140, fontWeight: 900, color: "#fff3d6", textShadow: glowText(), transform: `scale(${s})`, lineHeight: 1.25 }}>
        आपका जवाब?
      </div>
      <div
        style={{
          marginTop: 30,
          fontSize: 54,
          fontWeight: 800,
          color: "#1a1206",
          background: GOLD,
          padding: "16px 40px",
          borderRadius: 999,
          transform: `scale(${Math.min(1, s2)})`,
          opacity: Math.min(1, s2),
        }}
      >
        कमेंट में लिखिए
      </div>
    </AbsoluteFill>
  );
};

// ---------- cinematic touches ----------
const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%), linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0) 18%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.45))",
    }}
  />
);

/** darkens the river while the letters are on screen so they pop */
const FocusDim: React.FC = () => {
  const { t } = useT();
  const o = window01(t, SCENES.question + 1.6, SCENES.outro + 0.6, 0.6) * 0.35;
  return <AbsoluteFill style={{ background: "#020412", opacity: o }} />;
};

const DipToBlack: React.FC = () => {
  const { t } = useT();
  const cut = Math.max(
    ...CUTS.map((c) => interpolate(Math.abs(t - c), [0, 0.22], [1, 0], clampOpts)),
    interpolate(t, [0, 0.4], [1, 0], clampOpts),
    interpolate(t, [DURATION_S - 0.8, DURATION_S], [0, 1], clampOpts),
  );
  return <AbsoluteFill style={{ background: "black", opacity: cut }} />;
};

export const Overlays: React.FC = () => (
  <>
    <Vignette />
    <FocusDim />
    <Chip text="बोइत बंदाण · कार्तिक पूर्णिमा" from={SCENES.sail + 0.25} to={SCENES.betel - 0.15} />
    <RouteMap />
    <OfferingTags />
    <ChantCard />
    <Chip text="एक लोकप्रिय व्याख्या" from={T.popular} to={T.debate} />
    <Chip text="स्रोत एकमत नहीं" from={T.debate} to={SCENES.outro} />
    <Letters />
    <Countdown />
    <OutroText />
  </>
);

export { DipToBlack };
