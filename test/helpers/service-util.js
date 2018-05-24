/*global window*/
import { ClientFunction } from 'testcafe';
import { waitForReact } from '../../';

export async function loadApp (version) {
    await ClientFunction(() => {
        if (window.loadApp)
            window.loadApp(version);

        else {
            setTimeout(() => {
                window.loadApp(version);
            }, 200);
        }
    }, { dependencies: { version } })();
    await waitForReact();
}
