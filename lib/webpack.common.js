const path = require("path");

const manager = {
    mode: "production",
    entry: {
        index: "./src/index.ts",
        process: "./src/PSDAnimator.ts",
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    module: {
        rules: [{ test: /\.ts$/, loader: "ts-loader", options: { configFile: "tsconfig.json" } }],
    },
    output: {
        // filename: {
        //     index: "index.js",
        //     process: "PSDAnimator.js",
        // },
        filename: "[name].js",
        libraryTarget: "umd",
        globalObject: "typeof self !== 'undefined' ? self : this",
    },
};

module.exports = [manager];
