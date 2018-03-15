/*global fixture test document*/
import { ReactSelector, waitForReact } from '../../';

fixture `Server rendering`
    .page `http://localhost:1355/serverRender`
    .beforeEach(async () => {
        //NOTE: wait for client side initialization
        await waitForReact({ selectReactRoot: () => document.querySelector('#__next') });
    });

test('Should get component inside server rendered root node (React 16) - GH-69', async t => {
    const labelText = ReactSelector('Label').getReact(({ state }) => state.text);

    await t.expect(labelText).eql('Label Text...');
});