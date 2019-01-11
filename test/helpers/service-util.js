/*global window document*/
import { ClientFunction, t } from 'testcafe';
import { waitForReact } from '../../';

export async function loadApp (version) {
    const loadScript = ClientFunction(src => {
        if (!src) src = window.appSrc;

        const head   = document.getElementsByTagName('head')[0];
        const script = document.createElement('script');

        script.type  = 'text/javascript';
        script.async = false;
        script.src   = src;

        head.appendChild(script);
    });

    await loadScript('./vendor/react-' + version + '/react.js');
    await t.expect(ClientFunction(() => !!window.React)()).ok();

    await loadScript('./vendor/react-' + version + '/react-dom.js');
    await t.expect(ClientFunction(() => !!window.ReactDOM)()).ok();

    await loadScript();

    await waitForReact(3e4);
}
