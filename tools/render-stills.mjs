// Usage: node tools/render-stills.mjs <outDir> <StillId> [StillId...]
// Renders full-size PNGs of <Still> compositions from one bundle.
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";

const [outDir, ...ids] = process.argv.slice(2);
const browserExecutable = process.env.REMOTION_BROWSER || null;
const chromiumOptions = { gl: process.env.REMOTION_GL || "angle" };
fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
for (const id of ids) {
  const composition = await selectComposition({ serveUrl, id, browserExecutable, chromiumOptions });
  const output = path.join(outDir, `${id}.png`);
  await renderStill({ serveUrl, composition, output, imageFormat: "png", browserExecutable, chromiumOptions });
  console.log("wrote", output);
}
