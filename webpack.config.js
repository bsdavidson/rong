var webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");


module.exports = {
  devtool: "source-map",
  entry: {
    "index": "./src/index"
  },
  externals: {
    "react/addons": true,
    "react/lib/ExecutionEnvironment": true,
    "react/lib/ReactContext": true,
    "assets": true
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        query: {
          presets: ["es2015", "react"]
        }
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract("style", "css?sourceMap", "sass?sourceMap")
      },
      {
        test: /\.png$/,
        loader: "url-loader",
        query: {
          mimetype: "image/png"
        }
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        loader: "file?name=assets/[name].[ext]"
      }
    ]
  },
  plugins: [
    // Output extracted CSS to a file
    new ExtractTextPlugin("bundle.css")
  ],
  output: {
    path: __dirname,
    filename: "./bundle.js"
  },
  resolve: {
    extensions: ["", ".js", ".jsx"]
  }
};
