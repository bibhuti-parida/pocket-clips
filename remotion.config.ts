import { Config } from "@remotion/cli/config";

// "angle" uses the GPU-backed WebGL path in headless Chrome; required for Three.js.
Config.setChromiumOpenGlRenderer("angle");
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
