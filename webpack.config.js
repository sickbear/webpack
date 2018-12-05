'use strict';

const enableImageCompress = true; // включить сжатие изображений

const path = require('path');
const glob = require('glob');
const CleanWebpackPlugin = require('clean-webpack-plugin'); // очиска папки dist перед сборкой
const HtmlWebpackPlugin = require('html-webpack-plugin'); // чтение html
const UglifyJsPlugin = require("uglifyjs-webpack-plugin"); // минимизация js
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); // чтение css
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin"); // минимизация css
const ImageminWebpWebpackPlugin= require("imagemin-webp-webpack-plugin"); // конвертация изображений в webp
const ImageminPlugin = require('imagemin-webpack-plugin').default // общий плагин сжатия изображений
const ImageminMozjpeg = require('imagemin-mozjpeg') // плагин сжатия JPG
const CopyWebpackPlugin = require('copy-webpack-plugin'); // копирование файлов
const PurifyCSSPlugin = require('purifycss-webpack'); // обрезание неиспользуемого css
const WebpackOnBuildPlugin = require('on-build-webpack'); // действия после завершения сборки

module.exports = (env, argv) => {
    console.log('\x1b[36m', `Начало сборки в режиме ${argv.mode}`, '\x1b[0m');
    
    let config = {
        devServer: {
            overlay: true,
            hot: true,
//            contentBase: path.join(__dirname, 'dist'),
//            compress: true,
//            port: 9000,
//            public: 'webpack3.it-07.aim/dist'
        },
        devtool: 'eval-sourcemap',
        entry: { 
            main: './src/index.js',
            page404: './src/page404.js'
        },
        output: {
            path: path.resolve(__dirname, 'web/'),
            filename: 'js/[name].[contenthash].js'
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env']
                        }
                    }
                },
                {
                    test: /\.css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        { 
                            loader: 'css-loader', 
                            options: {
                                url: false
                            } 
                        }
                    ]
                },
                {
                    test: /\.php$/,
                    use: ['html-loader']
                },
                {
                    test: /\.(jpe?g|png)$/i,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: '[name].[ext]',
                                outputPath: 'images/'
                            }
                        }
                    ]
                }
            ]
        },
        plugins: [
            new PurifyCSSPlugin({
                minimize: true,
                paths: glob.sync(path.join(__dirname, 'src/*.php')),
            }),
            new MiniCssExtractPlugin({
                filename: "css/[name].[contenthash].css"
            }),
            new HtmlWebpackPlugin({
                template: 'src/index.php',
                filename: 'index.php',
                chunks: ['main'],
                favicon: 'src/images/favicon.ico',
                minify: {
                    removeComments: true,
                    collapseWhitespace: true
                }
            }),
            new HtmlWebpackPlugin({
                template: 'src/404.php',
                filename: '404.php',
                chunks: ['page404'],
                favicon: 'src/images/favicon.ico',
                minify: {
                    removeComments: true,
                    collapseWhitespace: true
                }
            }),
            new CopyWebpackPlugin([
                {
                    from: 'src/fancy/',
                    to: 'fancy'
                },
                {
                    from: 'src/images/unloading/',
                    to: 'images/'
                },
                {
                    from: 'src/fonts',
                    to: 'fonts/'
                },
                {
                    from: 'src/uploadupdate',
                    to: 'uploadupdate/'
                }
            ]),
            new ImageminWebpWebpackPlugin({
                config: [{
                    test: /\.(jpe?g|png)$/,
                    options: {
                      quality: 80
                    }
                  }],
                detailedLogs: false
            })
        ],
        optimization: {
            minimizer: [
                new UglifyJsPlugin({
                    cache: true,
                    parallel: true,
                    sourceMap: true
                }),
                new OptimizeCSSAssetsPlugin({})
            ]
        }
    }
    
    if (argv.mode === 'production') {
        config.plugins.push(new CleanWebpackPlugin(['web']));
        config.devtool = false;
    }
    
    if (enableImageCompress) {
        config.plugins.push(
            new ImageminPlugin({
                disable: false,
                optipng: {
                    optimizationLevel: 3
                },
                plugins: [
                    ImageminMozjpeg({
                        quality: 80,
                        progressive: true
                    })
                ]
            })
        )
    } 
    
    return config;
};

