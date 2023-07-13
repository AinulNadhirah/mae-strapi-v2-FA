const path = require("path");

const commonPlugins = [
    [
        require.resolve("babel-plugin-module-resolver"),
        {
            root: [path.resolve("./")],
            extensions: [".ios.js", ".android.js", ".js", ".json"],
            alias: {
                "@components": "./src/components",
                "@screens": "./src/screens",
                "@navigation": "./src/navigation",
                "@constants": "./src/constants",
                "@assets": "./src/assets",
                "@services": "./src/services",
                "@redux": "./src/redux",
                "@layouts": "./src/components/Layouts",
                "@utils": "./src/utilities",
                "@context": "./src/context",
                "@native": "./natives",
                "@config": "./src/config",
                "@libs": "./src/libs",
                "@styles": "./src/styles",
            },
        },
    ],
];

module.exports = function (api) {
    let mergedPlugins = [...commonPlugins];

    if (api.env("production")) {
        mergedPlugins = [...mergedPlugins, "transform-remove-console", "ignite-ignore-reactotron"];
    }
    return {
        presets: ["module:metro-react-native-babel-preset"],
        plugins: [...mergedPlugins],
    };
};
