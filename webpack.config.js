var webpack = require('webpack'),
    ExtractTextPlugin = require('extract-text-webpack-plugin');
var env = process.env.NODE_ENV || 'production';
var config = {
    "entry": {
        "index": "./src/main.jsx",
        "vendor": [
            "react",
            "react-dom",
            "pull-element"
        ]
    },
    "resolve": {
        "extensions": ["", ".js", ".jsx"] //当requrie的模块找不到时，添加这些后缀
    },
    "output": {
        "path": "./build",
        "filename": "js/[name].js"
    },
    "watch": true,
    "module": {
        loaders: [{
            test: /\.js|.jsx$/,
            exclude: /node_modules/,
            loader: "babel"
        }, {
            test: /\.(less|scss|sass|css)$/,
            loader: ExtractTextPlugin.extract("style", "css!sass-loader", {
                publicPath: '../'
            })
        }]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: "vendor",
            filename: "js/bundle.js"
        }),
        new ExtractTextPlugin("css/index.css")
    ]
};


module.exports = config;