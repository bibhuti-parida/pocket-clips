import { createTikTokStyleCaptions, type Caption } from "@remotion/captions";
import { useMemo } from "react";
import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import defaultCaptions from "../public/captions.json";

/**
 * Captions use Remotion's standard Caption format:
 *   { text, startMs, endMs, timestampMs, confidence }
 * (every word after the first starts with a space).
 */
type Props = {
  captions?: Caption[];
  /** How eagerly words are grouped into one on-screen "page" */
  combineMs?: number;
  /** [startMs, endMs] ranges where captions are hidden (e.g. a lyric card is on screen) */
  hideRanges?: [number, number][];
  fontFamily?: string;
  fontSizeRatio?: number;
  /** distance from the bottom, as a fraction of height */
  bottom?: number;
  uppercase?: boolean;
  highlight?: string;
};

export const Captions: React.FC<Props> = ({
  captions = defaultCaptions as Caption[],
  combineMs = 1200,
  hideRanges = [],
  ...style
}) => {
  const { fps } = useVideoConfig();
  const visible = useMemo(
    () => captions.filter((c) => !hideRanges.some(([a, b]) => c.startMs >= a && c.startMs < b)),
    [captions, hideRanges],
  );
  const { pages } = useMemo(
    () => createTikTokStyleCaptions({ captions: visible, combineTokensWithinMilliseconds: combineMs }),
    [visible, combineMs],
  );

  return (
    <AbsoluteFill>
      {pages.map((page, i) => {
        const next = pages[i + 1] ?? null;
        const lastTokenEnd = page.tokens[page.tokens.length - 1]?.toMs ?? page.startMs + page.durationMs;
        // hold a page until the next one starts, but never more than 1.2s past its last word
        const endMs = Math.min(next ? next.startMs : Infinity, lastTokenEnd + 1200);
        const startFrame = Math.round((page.startMs / 1000) * fps);
        const endFrame = Math.round((endMs / 1000) * fps);
        if (endFrame <= startFrame) return null;
        return (
          <Sequence key={i} from={startFrame} durationInFrames={endFrame - startFrame} layout="none">
            <CaptionPage page={page} {...style} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

type Page = ReturnType<typeof createTikTokStyleCaptions>["pages"][number];

const CaptionPage: React.FC<{ page: Page } & Omit<Props, "captions" | "combineMs" | "hideRanges">> = ({
  page,
  fontFamily = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  fontSizeRatio = 0.075,
  bottom,
  uppercase = true,
  highlight = "#ffd25b",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const timeMs = (frame / fps) * 1000 + page.startMs;
  const enter = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 8 });
  const fontSize = Math.round(Math.min(width, height) * fontSizeRatio);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: height * (bottom ?? (width > height ? 0.1 : 0.22)),
      }}
    >
      <div
        style={{
          fontFamily,
          fontWeight: 800,
          fontSize,
          textTransform: uppercase ? "uppercase" : "none",
          textAlign: "center",
          maxWidth: width * 0.86,
          lineHeight: 1.35,
          color: "white",
          WebkitTextStroke: `${fontSize * 0.1}px rgba(0,0,0,0.85)`,
          paintOrder: "stroke",
          textShadow: "0 4px 18px rgba(0,0,0,0.6)",
          transform: `scale(${0.85 + 0.15 * enter}) translateY(${(1 - enter) * 24}px)`,
          opacity: enter,
          whiteSpace: "pre-wrap",
        }}
      >
        {page.tokens.map((t) => {
          const active = timeMs >= t.fromMs && timeMs < t.toMs + 80;
          return (
            <span key={t.fromMs} style={{ color: active ? highlight : "white" }}>
              {t.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
