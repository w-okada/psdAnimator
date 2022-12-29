const path = require("path");

const manager = {
    mode: "production",
    entry: "./src/index.ts",
    resolve: {
        extensions: [".ts", ".js"],
    },
    module: {
        rules: [{ test: /\.ts$/, loader: "ts-loader", options: { configFile: "tsconfig.json" } }],
    },
    output: {
        filename: "index.js",
        libraryTarget: "umd",
        globalObject: "typeof self !== 'undefined' ? self : this",
    },
};

module.exports = [manager];
