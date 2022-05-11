/*global ClientFunction document NodeFilter*/

/*eslint-disable no-unused-vars*/
function waitForReact (timeout, testController) {
    /*eslint-enable no-unused-vars*/
    const DEFAULT_TIMEOUT = 1e4;
    const checkTimeout    = typeof timeout === 'number' ? timeout : DEFAULT_TIMEOUT;

    return ClientFunction(() => {
        const CHECK_INTERVAL = 200;
        let stopChecking     = false;

        function findReact16to18Root () {
            const treeWalker = document.createTreeWalker(document, NodeFilter.SHOW_ELEMENT, null, false);

            while (treeWalker.nextNode()) {
                //NOTE: fast check for 16 and 17 react
                if (treeWalker.currentNode.hasOwnProperty('_reactRootContainer')) return true;

                //NOTE: react 18
                for (const prop of Object.keys(treeWalker.currentNode))
                    if (/^__reactContainer/.test(prop)) return true;
            }

            return false;
        }

        function findReact15OrStaticRenderedRoot () {
            const rootEl = document.querySelector('[data-reactroot]');

            //NOTE: we have data-reactroot in static render even before hydration
            return rootEl && Object.keys(rootEl).some(prop => /^__reactInternalInstance/.test(prop));
        }

        function findReactApp () {
            const isReact15OrStaticRender = findReact15OrStaticRenderedRoot();
            const isReact16to18WithHandlers   = !!Object.keys(document).filter(prop => /^_reactListenersID|^_reactEvents/.test(prop)).length;

            return isReact15OrStaticRender || isReact16to18WithHandlers || findReact16to18Root();
        }

        return new Promise((resolve, reject) => {
            function tryFindReactApp () {
                const startTime        = new Date();
                const reactTreeIsFound = findReactApp();
                const checkTime        = new Date() - startTime;

                if (reactTreeIsFound) {
                    resolve();
                    return;
                }

                if (stopChecking) return;

                setTimeout(tryFindReactApp, checkTime > CHECK_INTERVAL ? checkTime : CHECK_INTERVAL);
            }

            tryFindReactApp();

            setTimeout(() => {
                stopChecking = true;

                reject('waitForReact: The waiting timeout is exceeded');
            }, checkTimeout);
        });
    }, { dependencies: { checkTimeout }, boundTestRun: testController })();
}
