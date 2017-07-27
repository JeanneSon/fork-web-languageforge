var webpack = require('webpack');
var path = require('path');
var webpackMerge = require('webpack-merge');
var LiveReloadPlugin = require('webpack-livereload-plugin');

// Webpack Config
var webpackConfig = {
  entry: {},

  output: {
    publicPath: '',
    path: path.resolve(__dirname, 'src', 'dist')
  },

  plugins: [
    new webpack.ContextReplacementPlugin(

      // The ([\\/]) piece accounts for path separators in *nix and Windows
      /angular([\\/])core([\\/])@angular/,
      path.resolve(__dirname, './src'),

      // your Angular Async Route paths relative to this root directory
      {}
    ),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function (module) {
        // this assumes your vendor imports exist in the node_modules directory
        return module.context && module.context.indexOf('node_modules') !== -1;
      }
    }),

    // CommonChunksPlugin will now extract all the common modules from vendor and main bundles
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest'
    }),
    new LiveReloadPlugin()
  ],

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          { loader: 'awesome-typescript-loader' }
        ]
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          { loader: 'raw-loader' },
          { loader: 'sass-loader' }
        ]
      },
      { test: /\.css$/, use: 'raw-loader' },
      { test: /\.html$/, use: 'raw-loader' }
    ]
  }

};

// Our Webpack Defaults
var defaultConfig = {
  devtool: 'source-map',

  output: {
    filename: '[name].bundle.js',
    sourceMapFilename: '[name].map',
    chunkFilename: '[id].chunk.js'
  },

  resolve: {
    extensions: ['.ts', '.js'],
    modules: [path.resolve(__dirname, 'node_modules')]
  },

  devServer: {
    historyApiFallback: true,
    watchOptions: { aggregateTimeout: 300, poll: 1000 },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    }
  },

  node: {
    global: true,
    crypto: 'empty',
    __dirname: true,
    __filename: true,
    process: true,
    Buffer: false,
    clearImmediate: false,
    setImmediate: false
  }
};

module.exports = function (env) {
  var mainPath =  './src/angular-app/languageforge/main.ts';
  if (env && env.applicationName) {
    mainPath = './src/angular-app/' + env.applicationName + '/main.ts';
  }

  webpackConfig.entry.main = mainPath;
  return webpackMerge(defaultConfig, webpackConfig);
};
