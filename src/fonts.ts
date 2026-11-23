import { continueRender, delayRender, staticFile } from "remotion";

/** Bundled Devanagari font. Importing this module blocks rendering until it has loaded. */
export const HINDI_FONT_FAMILY = "NotoDeva";

const handle = delayRender("Loading Noto Sans Devanagari");
const face = new FontFace(HINDI_FONT_FAMILY, `url(${staticFile("fonts/NotoSansDevanagari-800.woff2")}) format("woff2")`, {
  weight: "100 900",
});
face
  .load()
  .then((f) => {
    document.fonts.add(f);
    continueRender(handle);
  })
  .catch((err) => {
    console.error(err);
    continueRender(handle);
  });
