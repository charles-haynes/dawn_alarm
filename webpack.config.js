/* jshint esversion:6 */
const path = require('path');
const webpack = require('webpack');
const { getIfUtils, removeEmpty } = require('webpack-config-utils');

module.exports = env => {
  const { ifProd, ifNotProd } = getIfUtils(env);

  return {
    entry: './index.jsx',
    context: __dirname,
    output: {
      path: path.resolve(__dirname, './build'),
      filename: 'bundle.js',
      publicPath: '/build/',
      pathinfo: ifNotProd(),
    },
    devtool: ifProd('source-map', 'eval'),
    devServer: {
      port: 8080,
      historyApiFallback: true,
    },
    resolve: {
      extensions: ['.js', '.jsx'],
    },
    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
        },
        {
          test: /(\.css|\.scss)/,
          loader: 'style-loader!css-loader!resolve-url-loader!sass-loader',
        },
        { test: /(\.eot|\.woff2|\.woff|\.ttf|\.svg)/, loader: 'file-loader' },
      ],
    },
    plugins: removeEmpty([
      ifNotProd(new webpack.NamedModulesPlugin()), // TODO remove this when it becomes the default
      ifProd(
        new webpack.LoaderOptionsPlugin({
          minimize: true,
          debug: false,
          quiet: true,
        })
      ),
      ifProd(
        new webpack.DefinePlugin({
          'process.env': {
            NODE_ENV: '"production"',
          },
        })
      ),
      ifProd(
        new webpack.optimize.UglifyJsPlugin({
          sourceMap: true,
          compress: {
            screw_ie8: true, // eslint-disable-line
            warnings: false,
          },
        })
      ),
    ]),
  };
};
