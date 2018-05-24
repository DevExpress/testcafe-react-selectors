/*global window*/
import { ClientFunction, t } from 'testcafe';
import { waitForReact } from '../../';

export async function loadApp (version) {
    await t.expect(ClientFunction(() => !!window.loadApp)).ok({ timeout: 3e4 });

    await ClientFunction(() => {
        window.loadApp(version);
    }, { dependencies: { version } })();

    await t.expect(ClientFunction(() => !!window.React)).ok({ timeout: 3e4 });
    await waitForReact(3e4);
}
