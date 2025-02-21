const path = require('path');

module.exports = {
  entry: './index.html', // Replace with the actual entry file of your app
  output: {
    filename: 'bundle.js', // Name of the output file
    path: path.resolve(__dirname, 'dist'), // Output directory
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader', // Use Babel for JS transpilation
      },
    ],
  },
};
