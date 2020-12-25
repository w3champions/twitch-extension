module.exports = {
  publicPath: "./",
  pages: {
    panel: "./src/panel/index.ts",
    config: "./src/config/index.ts",
    // eslint-disable-next-line @typescript-eslint/camelcase
    video_component: "./src/component/index.ts",
    // eslint-disable-next-line @typescript-eslint/camelcase
    video_overlay: "./src/overlay/index.ts"
  },
  devServer: {
    host: "localhost",
    https: true,
    port: 8080
  }
};
