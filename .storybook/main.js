const baseConfig = require("../webpack.common");

module.exports = {
  stories: ["../src/**/story.tsx"],
  webpackFinal: config => {
    return {
      ...config,
      module: {
        ...config.module,
        rules: [
          ...baseConfig.module.rules,
          {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: require.resolve("babel-loader"),
          },
        ],
      },
      resolve: {
        ...config.resolve,
        ...baseConfig.resolve,
      },
    };
  },
};
