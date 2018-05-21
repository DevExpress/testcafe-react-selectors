/*global window*/
import { t, ClientFunction } from 'testcafe';

export async function loadApp (version) {
    await ClientFunction(() => window.loadApp(version), { dependencies: { version } })();
    await t.wait(300);
}
