const express = require('express');
const path    = require('path');
const next    = require('next');

const TEST_RESOURCES_PORT = 1355;

module.exports = function () {
    return new Promise(resolve => {
        const nextjsApp = next({ dir: path.join(__dirname, './data/server-render') });

        // NOTE: https://nextjs.org/docs/pages/building-your-application/configuring/custom-server
        return nextjsApp.prepare()
            .then(() => {
                return nextjsApp.getRequestHandler();
            })
            .then(handle => {
                express()
                    .use(express.static(path.join(__dirname, './data')))
                    .disable('view cache')
                    .get('/serverRender', (req, res) => {
                        console.log('server render: ', req.url);

                        nextjsApp.render(req, res, '/');
                    })
                    .get('*', (req, res) => handle(req, res))
                    .listen(TEST_RESOURCES_PORT, resolve);
            });
    });
};
