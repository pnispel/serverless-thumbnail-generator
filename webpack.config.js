const path = require('path');
const slsw = require('serverless-webpack');

module.exports = {
  target: 'node',
  entry: slsw.lib.entries,
  resolve: {
    extensions: [
      '.js',
      '.jsx',
      '.json',
    ]
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ],
  },
};
