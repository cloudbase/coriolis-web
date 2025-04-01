/* eslint-disable @typescript-eslint/no-var-requires */
const { merge } = require("webpack-merge");
const common = require("./webpack.common");

module.exports = merge(common, {
  mode: "development",
  devtool: "eval-source-map",
  devServer: {
    port: 3001,
    hot: true,
    historyApiFallback: true,
    proxy: {
      context: ["/api", "/proxy"],
      target: `http://localhost:${process.env.PORT || 3000}`,
    },
    stats: "minimal",
  },
});
