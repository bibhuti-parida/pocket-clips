# video3d: 3D animated videos with Three.js + Remotion

| Layer    | Tool                                                  | File                 |
| -------- | ----------------------------------------------------- | -------------------- |
| 3D scene | Three.js via `@react-three/fiber` + `@remotion/three` | `src/Scene3D.tsx`    |
| Captions | `@remotion/captions` (TikTok-style word highlight)    | `src/Captions.tsx`   |
| Audio    | Remotion `<Html5Audio>`                               | `src/Main3D.tsx`     |
| Render   | Remotion CLI → MP4 (H.264 + AAC)                      | `remotion.config.ts` |

## Commands

```bash
npm install
npm run studio                                   # live preview + timeline in the browser
npm run render                                   # 1920x1080 → out/video.mp4
npx remotion render Main3DVertical out/vertical.mp4   # 1080x1920 for Shorts/Reels
```

## Golden rule

Animate **only** with `useCurrentFrame()` (plus `interpolate` / `spring`).
Do **not** use R3F's `useFrame()`, `THREE.Clock` or drei helpers that run on their own clock.
Remotion renders frames in parallel and out of order, so clock-based animation flickers or jumps.

## Swapping in your own content

- **Audio / voiceover:** drop a file into `public/` and change `staticFile("music.mp3")`.
  Add more `<Html5Audio>` tags for music plus voice; wrap one in `<Sequence from={...}>` to delay it.
- **Captions:** replace `public/captions.json` (`{ text, startMs, endMs, timestampMs, confidence }`, words after the first start with a space).
  Auto-generate from a voiceover with `@remotion/install-whisper-cpp`, or convert an `.srt` with `parseSrt()`.
- **3D models:** put a `.glb` in `public/` and load it with `useGLTF(staticFile("model.glb"))` from `@react-three/drei`.
- **Length / fps / size:** `src/Root.tsx`.

## Rendering notes

- On a normal machine with a GPU, `remotion.config.ts` uses `angle` (GPU WebGL).
- On a headless server without a GPU, add `--gl=swangle` (software WebGL; slower but works).
- On first render Remotion downloads Chrome Headless Shell. If that's blocked, pass
  `--browser-executable=/path/to/chrome-headless-shell`.

## Production workflow (as used for `AaKaMaBaiShort`)

1. **Script:** `scriptforge` skill → `scripts/<slug>.md`.
2. **Voiceover:** ElevenLabs TTS (`eleven_v4`), one take → `public/voiceover/<slug>.mp3`.
   Script pause markers map to `[pause]` / `[long pause]` / `…`.
3. **Word timings:** ElevenLabs Scribe transcription of that take → `data/<slug>-words.json`,
   converted to Remotion captions in `public/captions-<slug>.json` (audio tags like `[pause]` dropped).
4. **Timeline:** copy key word times into `src/shorts/<slug>/timeline.ts`; scenes, letters,
   countdowns etc. are keyed to those times so visuals land on the spoken word.
5. **Scenes:** `RiverScene.tsx` (Three.js world, camera per scene) + `Overlays.tsx` (HTML graphics).
   Hindi text uses the bundled Noto Sans Devanagari (`public/fonts/`), loaded with `delayRender`.
6. **Preview frames fast:** `npm run preview -- AaKaMaBaiShort out/preview 1.5 18 33 50`
   (bundles once, writes half-size JPGs).
7. **Render:** `npm run render:aakamabai` → `out/aa-ka-ma-bai-short.mp4`.

Background music: `public/music/drone.mp3` (generated tanpura-style drone, kept at ~16% volume under the voice).
