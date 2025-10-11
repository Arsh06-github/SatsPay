// Webpack configuration for production optimization
const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const shouldAnalyze = process.env.ANALYZE === 'true';

  return {
    // Optimization settings
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          // Vendor chunk for third-party libraries
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          // Bitcoin-specific libraries
          bitcoin: {
            test: /[\\/]node_modules[\\/](bitcoinjs-lib|@getalby\/sdk)[\\/]/,
            name: 'bitcoin',
            chunks: 'all',
            priority: 20,
          },
          // UI libraries
          ui: {
            test: /[\\/]node_modules[\\/](react|react-dom|zustand)[\\/]/,
            name: 'ui',
            chunks: 'all',
            priority: 15,
          },
          // Common utilities
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      },
      // Runtime chunk for better caching
      runtimeChunk: 'single',
      // Minimize in production
      minimize: isProduction,
      // Use TerserPlugin for better minification
      minimizer: isProduction ? [
        new (require('terser-webpack-plugin'))({
          terserOptions: {
            compress: {
              drop_console: true, // Remove console.log in production
              drop_debugger: true,
              pure_funcs: ['console.log', 'console.info', 'console.debug'],
            },
            mangle: {
              safari10: true,
            },
            format: {
              comments: false,
            },
          },
          extractComments: false,
        }),
        new (require('css-minimizer-webpack-plugin'))(),
      ] : [],
    },

    // Performance hints
    performance: {
      hints: isProduction ? 'warning' : false,
      maxEntrypointSize: 512000, // 500kb
      maxAssetSize: 512000, // 500kb
    },

    // Resolve configuration
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@services': path.resolve(__dirname, 'src/services'),
        '@stores': path.resolve(__dirname, 'src/stores'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@types': path.resolve(__dirname, 'src/types'),
        '@platform': path.resolve(__dirname, 'src/platform'),
      },
      // Optimize module resolution
      modules: ['node_modules'],
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    },

    // Module rules
    module: {
      rules: [
        // TypeScript/JavaScript
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-env', { useBuiltIns: 'usage', corejs: 3 }],
                  ['@babel/preset-react', { runtime: 'automatic' }],
                  '@babel/preset-typescript',
                ],
                plugins: [
                  // React optimization plugins
                  isProduction && 'babel-plugin-transform-react-remove-prop-types',
                  isProduction && '@babel/plugin-transform-react-inline-elements',
                  isProduction && '@babel/plugin-transform-react-constant-elements',
                  // Import optimization
                  ['babel-plugin-import', {
                    libraryName: 'lodash',
                    libraryDirectory: '',
                    camel2DashComponentName: false,
                  }, 'lodash'],
                ].filter(Boolean),
                cacheDirectory: true,
              },
            },
          ],
        },
        // CSS optimization
        {
          test: /\.css$/,
          use: [
            isProduction ? require('mini-css-extract-plugin').loader : 'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                modules: false,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    require('tailwindcss'),
                    require('autoprefixer'),
                    isProduction && require('cssnano')({
                      preset: 'default',
                    }),
                  ].filter(Boolean),
                },
              },
            },
          ],
        },
        // Image optimization
        {
          test: /\.(png|jpe?g|gif|svg|webp)$/i,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 8 * 1024, // 8kb
            },
          },
          generator: {
            filename: 'images/[name].[contenthash:8][ext]',
          },
          use: isProduction ? [
            {
              loader: 'image-webpack-loader',
              options: {
                mozjpeg: {
                  progressive: true,
                  quality: 80,
                },
                optipng: {
                  enabled: false,
                },
                pngquant: {
                  quality: [0.65, 0.90],
                  speed: 4,
                },
                gifsicle: {
                  interlaced: false,
                },
                webp: {
                  quality: 80,
                },
              },
            },
          ] : [],
        },
        // Font optimization
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name].[contenthash:8][ext]',
          },
        },
      ],
    },

    // Plugins
    plugins: [
      // Extract CSS in production
      isProduction && new (require('mini-css-extract-plugin'))({
        filename: 'css/[name].[contenthash:8].css',
        chunkFilename: 'css/[name].[contenthash:8].chunk.css',
      }),
      
      // Compression in production
      isProduction && new CompressionPlugin({
        algorithm: 'gzip',
        test: /\.(js|css|html|svg)$/,
        threshold: 8192,
        minRatio: 0.8,
      }),
      
      // Bundle analyzer
      shouldAnalyze && new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: true,
        reportFilename: 'bundle-report.html',
      }),
      
      // Define environment variables
      new (require('webpack')).DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(argv.mode || 'development'),
        'process.env.REACT_APP_VERSION': JSON.stringify(require('./package.json').version),
      }),
      
      // Progress plugin for better build feedback
      new (require('webpack')).ProgressPlugin(),
      
    ].filter(Boolean),

    // Development server configuration
    devServer: isProduction ? undefined : {
      hot: true,
      compress: true,
      historyApiFallback: true,
      open: true,
      overlay: {
        warnings: false,
        errors: true,
      },
    },

    // Source maps
    devtool: isProduction ? 'source-map' : 'eval-source-map',

    // Cache configuration
    cache: {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
    },

    // Stats configuration
    stats: {
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false,
    },
  };
};