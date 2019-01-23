const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    library: 'wellogger',
    filename: 'wellogger.js',
    libraryTarget: 'window',
    path: path.resolve(__dirname, '../src/logger/staticresources/WELLogger')
  },
  devtool: 'sourcemap'
};
