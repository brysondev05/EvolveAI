const { getDefaultConfig } = require("expo/metro-config");

const defaultConfig = getDefaultConfig(__dirname);

const metroConfig = {
  ...defaultConfig,
  transformer: {
    ...defaultConfig.transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
    assetPlugins: ["expo-asset/tools/hashAssetFiles"],
  },
  resolver: {
    ...defaultConfig.resolver,
    assetExts: defaultConfig.resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...defaultConfig.resolver.sourceExts, "svg"],
  },
  server: {
    ...defaultConfig.server,
    enhanceMiddleware: (middleware) => {
      return (req, res, next) => {
        const otherAssets = "/node_modules/";

        if (req.url.startsWith(otherAssets)) {
          req.url = req.url.replace(otherAssets, "/assets/../../node_modules/");
        }

        return middleware(req, res, next);
      };
    },
  },
};

module.exports = metroConfig;
