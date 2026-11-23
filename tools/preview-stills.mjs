// Usage: node tools/preview-stills.mjs <compositionId> <outDir> <sec> [sec...]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";

const [id, outDir, ...secs] = process.argv.slice(2);
const browserExecutable = process.env.REMOTION_BROWSER || null;
const gl = process.env.REMOTION_GL || "angle";
fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const chromiumOptions = { gl };
const composition = await selectComposition({ serveUrl, id, browserExecutable, chromiumOptions });
for (const s of secs) {
  const frame = Math.round(Number(s) * composition.fps);
  const output = path.join(outDir, `${id}-${String(s).replace(".", "_")}s.jpg`);
  await renderStill({ serveUrl, composition, frame, output, imageFormat: "jpeg", jpegQuality: 80, scale: 0.5, browserExecutable, chromiumOptions });
  console.log("wrote", output);
}
