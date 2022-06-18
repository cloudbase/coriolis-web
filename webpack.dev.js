const merge = require('webpack-merge')
const common = require('./webpack.common')

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {
    port: 3001,
    hot: true,
    historyApiFallback: true,
    proxy: {
      '/api': `http://localhost:${process.env.PORT || 3000}`,
      '/proxy': `http://localhost:${process.env.PORT || 3000}`,
    },
    stats: 'minimal',
  },
})
