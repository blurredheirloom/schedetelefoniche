const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { spawn } = require('child_process')
const CopyPlugin = require("copy-webpack-plugin");
const PACKAGE = require('./package.json')
const defaultInclude = path.resolve(__dirname, 'src')

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }, { loader: 'postcss-loader' }],
        include: defaultInclude
      },
      {
        test: /\.jsx?$/,
        use: [{ loader: 'babel-loader' }],
        include: defaultInclude
      },
      {
        test: /\.(jpe?g|png|gif)$/,
        use: [{ loader: 'file-loader?name=img/[name]__[hash:base64:5].[ext]' }],
        include: defaultInclude
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        use: [{ loader: 'file-loader?name=font/[name]__[hash:base64:5].[ext]' }],
        include: defaultInclude
      }
    ]
  },
  target: 'electron-renderer',
  plugins: [
    new HtmlWebpackPlugin({title: PACKAGE.description}),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
      'process.env.AUTHOR': JSON.stringify(PACKAGE.author.name),
      'process.env.VERSION': JSON.stringify(PACKAGE.version),
    }),
    new CopyPlugin({
      patterns: [
        { from: "src/assets", to: "assets" },
      ],
    }),
  ],
  devtool: 'cheap-source-map',
  devServer: {
    static: path.resolve(__dirname, 'dist'),
    devMiddleware: {
      stats: {
        colors: true,
        chunks: false,
        children: false
      }
    },
    onBeforeSetupMiddleware() {
      spawn(
        'electron',
        ['.'],
        { shell: true, env: process.env, stdio: 'inherit' }
      )
      .on('close', code => process.exit(0))
      .on('error', spawnError => console.error(spawnError))
    }
  }
}
