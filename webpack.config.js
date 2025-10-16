// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isDev = process.env.NODE_ENV !== 'production';

module.exports = {
  entry: './src/index.tsx',
  output: {
    filename: isDev ? 'js/bundle.js' : 'js/bundle.[contenthash:8].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    publicPath: '/',
    assetModuleFilename: 'assets/[name][hash][ext][query]'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  devtool: isDev ? 'source-map' : false,
  devServer: {
    port: 5173,
    historyApiFallback: true,
    open: true,
    hot: true,
    static: path.resolve(__dirname, 'dist')
  },

  module: {
    rules: [
      {
        test: /\.[tj]sx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.s?css$/,
        use: [
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
          { loader: 'css-loader', options: { sourceMap: isDev } },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: isDev,
              postcssOptions: { plugins: [require('autoprefixer')] }
            }
          },
          { loader: 'sass-loader', options: { sourceMap: isDev } }
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource'
      },
      {
        test: /\.(woff2?|eot|ttf|otf)$/i,
        type: 'asset/resource'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/public/index.html',
      inject: 'body'
    }),
    new MiniCssExtractPlugin({
      filename: isDev ? 'css/main.css' : 'css/main.[contenthash:8].css'
    })
  ],
  mode: isDev ? 'development' : 'production'
};
