module.exports = {
    mode: 'production',
    entry: './script.js',  // Point to your script.js file as the entry
    output: {
      path: __dirname + '/dist',
      filename: 'bundle.js',  // The output bundled JavaScript file
    },
    module: {
      rules: [
        {
          test: /\.html$/,
          use: 'html-loader',  // Process HTML files
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './index.html',  // Use index.html as the template
      }),
    ],
    externals: {
      'firebase/app': 'firebase',
      'firebase/firestore': 'firebase.firestore',
      'face-api.js': 'faceapi',  // If you're using face-api.js as a global object
    },
  };
  


