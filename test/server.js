var express = require('express');
var path    = require('path');

const TEST_RESOURCES_PORT = 1355;

module.exports = function () {
    return new Promise(resolve => {
        express()
            .use(express.static(path.join(__dirname, './data')))
            .get('/', (req, res) => res.render('index.html'))
            .listen(TEST_RESOURCES_PORT, resolve);
    });
};
