/*global window*/
import { ClientFunction } from 'testcafe';
import { waitForReact } from '../../';

export async function loadApp (version) {
    await ClientFunction(() => {
        return new Promise(resolve => {
            if (window.loadApp) {
                window.loadApp(version);
                resolve();
            }

            else {
                setTimeout(() => {
                    window.loadApp(version);
                }, 200);
            }
        });
    }, { dependencies: { version } })();

    await waitForReact(3e4);
}
