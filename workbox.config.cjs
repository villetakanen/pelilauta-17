const globPath = process.env.SW_DIST_PATH;

if (!globPath) {
  console.error("SW_DIST_PATH not specified. Check your npm build script");
  return;
}

module.exports = {
  globDirectory: globPath,
  globPatterns: [
    "**/*.{css,png,webp,avif,mp4,html,ico,woff2,json,js,svg,xml,txt}",
  ],
  swDest: `${globPath}/service-worker.js`,
  swSrc: "./public/service-worker.js",
};