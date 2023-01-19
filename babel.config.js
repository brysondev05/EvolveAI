module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", {
      jsxRuntime: "automatic"
    }]],
    plugins: [
      [
        "babel-plugin-root-import",
        {
          paths: [
            {
              rootPathSuffix: "./",
              rootPathPrefix: "~/",
            },
          ],
        },
      ],
      ["@babel/plugin-proposal-decorators", { legacy: true }],
      'react-native-reanimated/plugin',
      
    ],
  };
};
