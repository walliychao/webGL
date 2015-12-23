var webpack = require('webpack');
var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('common.js');
var isProd = process.argv[2] === '-p';

module.exports = {
    entry: isProd ? './source/js/modules/index.jsx' : [
    'webpack-dev-server/client?http://127.0.0.1:3000',
    'webpack/hot/only-dev-server',
    './source/js/modules/index.jsx'
    ],
    output: {
        path: __dirname,
        filename: '[name].js'
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    resolveLoader: {
         modulesDirectories: ["node_modules"],
    },
    module: {
        loaders: [
        {
            test: /\.(js|jsx)$/,
            loader: 'babel-loader'
        }, { 
            test: /\.(glsl|vs|fs)$/, loader: 'shader' 
        }, { 
            test: /\.css$/, loader: 'style-loader!css-loader'
        }, {
            test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'
        } ]
    },
    plugins: [commonsPlugin,
    new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        }
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()],
    debug: isProd ? false : true,
    devtool: isProd ? 'eval' : 'eval',
    devServer: {
        port: 3000,
        hot: true,
        historyApiFallback: true
    }
};