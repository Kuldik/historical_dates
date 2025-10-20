// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProd ? 'production' : 'development',

  entry: './src/index.tsx',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isProd ? 'js/bundle.[contenthash:8].js' : 'js/bundle.js',
    clean: true,
    publicPath: isProd ? './' : '/',              
    assetModuleFilename: 'assets/[name].[contenthash:8][ext][query]',
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: { '@': path.resolve(__dirname, 'src') },
  },

  devtool: isProd ? false : 'source-map',

  devServer: {
    port: 5173,
    open: true,
    hot: true,
    historyApiFallback: true,
    static: path.resolve(__dirname, 'public'), 
  },

  module: {
    rules: [
      {
        test: /\.[tj]sx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.s?css$/i,
        use: [
          isProd ? MiniCssExtractPlugin.loader : 'style-loader',
          { loader: 'css-loader', options: { sourceMap: !isProd } },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: !isProd,
              postcssOptions: { plugins: [require('autoprefixer')] },
            },
          },
          { loader: 'sass-loader', options: { sourceMap: !isProd } },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff2?|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
    ],
  },

  plugins: [
    // index.html
    new HtmlWebpackPlugin({
      template: 'src/public/index.html',               
      filename: 'index.html',
      inject: 'body',
      minify: isProd,
    }),

    // 404.html — дубликат index для SPA фолбэка на GitHub Pages
    new HtmlWebpackPlugin({
      template: 'src/public/index.html',
      filename: '404.html',
      inject: 'body',
      minify: isProd,
    }),

    new MiniCssExtractPlugin({
      filename: isProd ? 'css/main.[contenthash:8].css' : 'css/main.css',
    }),
  ],
};
