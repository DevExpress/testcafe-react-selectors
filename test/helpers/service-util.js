/*global window*/
import { ClientFunction } from 'testcafe';
import { waitForReact } from '../../';

export async function loadApp (version) {
    await ClientFunction(() => window.loadApp(version), { dependencies: { version } })();
    await waitForReact();
}
