const CopyPlugin = require("copy-webpack-plugin");
module.exports = {
  entry: "./src/server.ts",
  output: {
    filename: "./dist/bundle.js",
  },
  target: "node",
  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",
  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
    fallback: {
      zlib: false,
      buffer: false,
      https: false,
      http: false,
      url: false,
      stream: false,
      assert: false,
      path: false,
      os: false,
      crypto: false,
      util: false,
      querystring: false,
      net: false,
      fs: false,
    },
  },
  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
      { test: /\.tsx?$/, loader: "ts-loader" },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { test: /\.js$/, loader: "source-map-loader", enforce: "pre" },
    ],
  },
  node: {
    __dirname: false,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        "./node_modules/swagger-ui-dist/swagger-ui.css",
        "./node_modules/swagger-ui-dist/swagger-ui-bundle.js",
        "./node_modules/swagger-ui-dist/swagger-ui-standalone-preset.js",
        "./node_modules/swagger-ui-dist/favicon-16x16.png",
        "./node_modules/swagger-ui-dist/favicon-32x32.png",
      ],
    }),
  ],
};
