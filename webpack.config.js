var Path = require('path');
var Package = require('./package.json');
var Webpack = require('webpack');

module.exports = {
    cache: true,
    devtool: 'source-map',
    context: Path.join(__dirname, 'src'),
    entry: [
        'webpack-dev-server/client?http://0.0.0.0:8080', // WebpackDevServer host and port
        'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors
        './webtask.js',
    ],
    output: {
        path: Path.join(__dirname, 'build'),
        filename: 'build.js',
        publicPath: '/build/',
        hash: true,
        library: 'webtaskWidget',
        libraryTarget: 'umd',
    },
    recordsPath: Path.join(__dirname, '.recordsCache'),
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loaders: ['react-hot', 'babel-loader'],
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
                test: /\.txt/,
                loader: 'raw-loader'
            }, {
                test: /\.json$/,
                loader: 'json-loader'
            }, {
                test: require.resolve('localforage'),
                loaders: ['exports-loader?localforage', 'script-loader'],
            }, {
                test: require.resolve('zeroclipboard'),
                loaders: ['expose-loader?ZeroClipboard'],
            }
        ],
        noParse: [
            require.resolve('localforage'),
        ],
    },
    plugins: [
        new Webpack.optimize.DedupePlugin(),
        // new ExtractTextPlugin('build.css'),
    ],
    resolve: {
        modulesDirectories: ['node_modules', 'src'],
        root: __dirname,
        alias: {},
    },
};