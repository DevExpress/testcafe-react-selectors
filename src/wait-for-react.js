/*global Promise, window*/

/*eslint-disable no-unused-vars*/
function waitForReact ({ waitTimeout, selectReactRoot } = {}) {
    return new Promise((resolve, reject) => {
        let pingIntervalId = null;
        let pingTimeoutId = null;
        const WAIT_TIMEOUT = waitTimeout || 10000;
        const PING_INTERVAL = 100;

        const clearTimeouts = () => {
            window.clearTimeout(pingTimeoutId);
            window.clearInterval(pingIntervalId);
        };

        const isThereReact = () => {
            if (typeof selectReactRoot === 'function') {
                const root = selectReactRoot() || {};

                return !!root._reactRootContainer;
            }
            return false;
        };

        const check = () => {
            if (isThereReact()) {
                clearTimeouts();
                resolve();
            }
        };

        pingTimeoutId = window.setTimeout(() => {
            clearTimeouts();
            reject(new Error('Cannot find React.'));
        }, WAIT_TIMEOUT);

        check();
        pingIntervalId = window.setInterval(check, PING_INTERVAL);
    });
}
