module.exports = {
    mode: 'production',
    entry: './script.js',  
    output: {
      path: __dirname + '/dist',
      filename: 'bundle.js',  
    },
    module: {
      rules: [
        {
          test: /\.html$/,
          use: 'html-loader',  
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './index.html',  
      }),
    ],
    externals: {
      'firebase/app': 'firebase',
      'firebase/firestore': 'firebase.firestore',
      'face-api.js': 'faceapi',  
    },
  };
  


