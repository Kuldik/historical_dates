const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  entry: './src/index.tsx',
  output: {
    filename: 'assets/js/[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    assetModuleFilename: 'assets/[hash][ext][query]',
    publicPath: '/'
  },
  resolve: { extensions: ['.ts', '.tsx', '.js'] },
  devtool: isProd ? 'source-map' : 'eval-source-map',
  devServer: {
    port: 5173,
    historyApiFallback: true,
    hot: true,
    open: true
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader', exclude: /node_modules/ },
      {
        test: /\.(scss|css)$/,
        use: [
          isProd ? MiniCssExtractPlugin.loader : 'style-loader',
          { loader: 'css-loader', options: { importLoaders: 2 } },
          {
            loader: 'postcss-loader',
            options: { postcssOptions: { plugins: [require('autoprefixer')] } }
          },
          'sass-loader'
        ]
      },
      { test: /\.(woff2?|ttf|eot)$/, type: 'asset/resource', generator: { filename: 'assets/fonts/[name][ext]' } },
      { test: /\.(svg|png|jpg|gif)$/, type: 'asset/resource' }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      minify: false
    }),
    new MiniCssExtractPlugin({ filename: 'assets/css/[name].[contenthash].css' })
  ]
};
