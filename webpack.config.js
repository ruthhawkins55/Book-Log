const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.js',  // Make sure your entry point is correct
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        use: 'html-loader',  // This loader will process HTML files
      },
      // Add other loaders as needed (e.g., for CSS, JS, etc.)
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',  // Your HTML file template
    }),
  ],
};

