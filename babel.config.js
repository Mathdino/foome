module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // OBRIGATÓRIO para react-native-reanimated v4 — deve ser o ÚLTIMO plugin
      "react-native-worklets/plugin",
    ],
  };
};
