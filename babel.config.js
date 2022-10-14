module.exports = api => {
  api.cache.using(() => process.env.NODE_ENV);

  const common = {
    presets: [
      ["@babel/env", { targets: { node: "current" } }],
      "@babel/typescript",
      "@babel/react",
    ],
    plugins: [
      "react-hot-loader/babel",
      [
        "@babel/plugin-proposal-decorators",
        {
          legacy: true,
        },
      ],
      "@babel/proposal-class-properties",
      "@babel/proposal-object-rest-spread",
      "@babel/plugin-proposal-optional-chaining",
    ],
  };
  if (
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "test"
  ) {
    common.plugins.push([
      "babel-plugin-styled-components",
      { displayName: true, minify: false },
    ]);
  } else {
    common.plugins.push([
      "babel-plugin-styled-components",
      { displayName: false, minify: true },
    ]);
  }

  return common;
};
