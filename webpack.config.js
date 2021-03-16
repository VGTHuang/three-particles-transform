const path = require("path");

module.exports = {
  target: "web",
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: "/dist/",
    filename: "main.js",
  },
  module: {
    rules: [
      {
        test: /\.glsl$/,
        loader: "webpack-glsl-loader",
      },
    ],
  },
};
