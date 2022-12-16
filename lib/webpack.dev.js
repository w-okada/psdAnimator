const { merge } = require('webpack-merge');
const common = require('./webpack.common.js')

const manager = merge(common[0],{
    mode: 'development',
})
module.exports = [manager];