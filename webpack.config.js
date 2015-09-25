var Config = require('./webpack.base.js');

Config.module.loaders.forEach(function (loader) {
    if (Array.isArray(loader.loaders) && loader.loaders.indexOf('babel-loader') >= 0) {
        loader.loaders.unshift('react-hot');
    }
});

Config.entry.unshift('webpack/hot/only-dev-server');
Config.entry.unshift('webpack-dev-server/client?http://0.0.0.0:8080');

module.exports = Config;