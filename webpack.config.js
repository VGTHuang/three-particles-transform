const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const htmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    target: "web",
    entry: {
        entry: ["./src/index.js"],
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        // publicPath: "/public/",
        filename: "bundle.js",
    },
    devServer: {
        contentBase: path.join(__dirname, "public"),
        // publicPath: "/",
    },
    module: {
        rules: [
            {
                test: /\.glsl$/,
                loader: "webpack-glsl-loader",
            },
        ],
    },
    plugins: [
        new htmlWebpackPlugin({
            template: path.join(__dirname, "public/index.html"),
            filename: "index.html",
        }),
        // new CopyWebpackPlugin({
        //     patterns: [{ from: path.resolve(__dirname, "public") }],
        //     options: {},
        // }),
        new CopyWebpackPlugin([{ from: path.resolve(__dirname, "public") }]),
    ],
};
