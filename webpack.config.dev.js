import path from 'path';
import webpack from 'webpack';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

import dotenv from 'dotenv';
dotenv.config(); 

process.env.PORT = 3000;

const GLOBALS = {
  'process.env.PORT': JSON.stringify(process.env.PORT)
};

export default {
  entry: [
    'webpack-hot-middleware/client?reload=true',
    './src/index.js'
  ],
  target: 'web',
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js',
    publicPath: '/',
  },
  devServer: {
    contentBase: './src',
    hot: true,
    inline: true,
    historyApiFallback: true  // loads index page on any 404 
  },
  plugins: [
    new webpack.DefinePlugin(GLOBALS),          // allows to create global constants
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    // new BundleAnalyzerPlugin()
  ],
  module: {
    rules: [  
      {test: /\.js$/, include: path.join(__dirname, 'src'), loader: 'babel-loader'},
      {test: /(\.scss)$/, 
        use: [
          {loader: 'style-loader'}, 
          {loader: 'css-loader'},
          {loader: 'sass-loader'},
        ],
      },
      {test: /\.(woff|woff2)$/, loader: "url-loader?prefix=font/&limit=5000"},
      {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url-loader?limit=10000&mimetype=application/octet-stream"},
      {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url-loader?limit=10000&mimetype=image/svg+xml"},
      {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file-loader"},
      {test: /\.(gif|svg|jpg|png)$/, loader: "url-loader?limit=100000"}
    ],
  }
};