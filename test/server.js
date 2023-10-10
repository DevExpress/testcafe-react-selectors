const express = require('express');
const path    = require('path');
const next    = require('next');

const TEST_RESOURCES_PORT = 1355;

module.exports = function () {
    let nextjsApp = null;
    let handle    = null;

    function serverRenderHandler (req, res) {
        let appPrepared = Promise.resolve();

        if (!nextjsApp) {
            nextjsApp = next({ dir: path.join(__dirname, './data/server-render') });

            // NOTE: https://nextjs.org/docs/pages/building-your-application/configuring/custom-server
            appPrepared = nextjsApp.prepare()
                .then(() => {
                    handle = nextjsApp.getRequestHandler();
                });
        }

        appPrepared.then(() => {
            nextjsApp.render(req, res, '/');
        });
    }

    return new Promise(resolve => {
        express()
            .use(express.static(path.join(__dirname, './data')))
            .disable('view cache')
            .get('/serverRender', serverRenderHandler)
            .get('*', (req, res) => handle(req, res))
            .listen(TEST_RESOURCES_PORT, resolve);
    });
};
