var Path = require('path');
var Package = require('./package.json');
var Webpack = require('webpack');


var merge = require('lodash.merge');

var baseConfig = {
    cache: true,
    // devtool: 'source-map',
    context: Path.join(__dirname, 'src'),
    output: {
        path: Path.join(__dirname, 'build'),
        filename: '[name].js',
        publicPath: '/dist/',
        hash: true,
        library: 'webtaskWidget',
        libraryTarget: 'umd',
    },
    // recordsPath: Path.join(__dirname, '.recordsCache'),
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules|sandboxjs/,
                loaders: ['babel-loader'],
            }, {
                test: /\.css$/,
                loaders: ['style-loader', 'css-loader', 'autoprefixer-loader'],
            }, {
                test: /\.less$/,
                loaders: ['style-loader', 'css-loader', 'autoprefixer-loader', 'less-loader'],
            }, {
                test: /\.styl$/,
                loaders: ['style-loader', 'css-loader', 'autoprefixer-loader', 'stylus-loader'],
            }, {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'url-loader?limit=10000&mimetype=application/font-woff'
            }, {
                test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'file-loader'
            }, {
                test: /\.html$/,
                loader: 'raw-loader'
            }, {
                test: /\.txt$/,
                loader: 'raw-loader'
            }, {
                test: /\.json$/,
                loader: 'json-loader'
            }
        ],
        noParse: [
        ],
    },
    plugins: [
        new Webpack.optimize.OccurenceOrderPlugin(),
        new Webpack.optimize.DedupePlugin()
    ],
    resolve: {
        modulesDirectories: ['node_modules', 'src'],
        root: __dirname,
        alias: {},
    },
    node: {
        fs: 'empty',
    },
    devServer: {
        devtool: 'source-map',
    },
};

if (process.env.NODE_ENV === 'production') {
    baseConfig.plugins.push(
        new Webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            mangle: {
                except: ['CronJob', 'Webtask']
            }
        })
    );
}

module.exports = [
    merge({}, baseConfig, {
        entry: { 'webtask': './webtask.js', },
    }),
    // merge({}, baseConfig, {
    //     entry: { 'webtask-bootstrap': './webtask.js', },
    // }),
];
