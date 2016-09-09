// Karma configuration
// Generated on Tue Jun 21 2016 23:51:46 GMT-0700 (PDT)
var webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = function(config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',
    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha'],
    // list of files / patterns to load in the browser
    files: ["test/index.js"],
    // list of files to exclude
    exclude: [],
    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      "test/index.js": ["webpack", "sourcemap"]
    },
    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['nyan', "notify"],
    // web server port
    port: 9876,
    // enable / disable colors in the output (reporters and logs)
    colors: true,
    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,
    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],
    webpack: {
      devtool: "inline-source-map",
      externals: {
        // Enzyme includes require statements for these modules for backwards compatibility
        // with older versions of React. Webpack gets confused by these, even though
        // they will never actually be required. We are Marking them as externals
        // so webpack doesn't complain.
        "react/addons": true,
        "react/lib/ExecutionEnvironment": true,
        "react/lib/ReactContext": true
      },
      module: {
        loaders: [
          {
            test: /\.json$/,
            loader: 'json'
          },
          {
            test: /\.jsx?$/,
            loader: "babel-loader",
            exclude: /node_modules/,
            query: {
              presets: ["es2015", "react"]
            }
          },
          {
            test: /\.(scss|css)$/,
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
      resolve: {
        extensions: ["", ".js", ".jsx", ".json"]
      },
      watch: true
    },
    webpackServer: {
      noInfo: true
    },

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  });
};
