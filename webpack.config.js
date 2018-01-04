const path = require("path");
const config = {
  entry : './src/main.js',
  output:{
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: 'assets'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['babel-preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          {loader : 'style-loader'},
          {loader : 'css-loader'}
        ],
        exclude : /node_modules/
      }
    ]
  }
}

module.exports = config;
