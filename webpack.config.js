const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (_env, argv) => {
  const isProd = argv.mode === 'production';

  return {
    mode: isProd ? 'production' : 'development',

    entry: './src/index.tsx',

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProd ? 'js/bundle.[contenthash:8].js' : 'js/bundle.js',
      clean: true,
      publicPath: isProd ? './' : '/', // критично для GH Pages
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
        { test: /\.[tj]sx?$/, use: 'ts-loader', exclude: /node_modules/ },
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
        { test: /\.(png|jpe?g|gif|svg)$/i, type: 'asset/resource' },
        { test: /\.(woff2?|eot|ttf|otf)$/i, type: 'asset/resource' },
      ],
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: 'src/public/index.html',
        filename: 'index.html',
        inject: 'body',
        minify: isProd,
      }),
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
};
