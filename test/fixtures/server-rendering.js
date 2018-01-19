/*global fixture test*/
import ReactSelector from '../../';
import { ClientFunction } from 'testcafe';

fixture `Server rendering`
    .page `http://localhost:1355/serverRender`
    .beforeEach(async t => {
        //NOTE: wait for client side initialization
        await ClientFunction(() => {
        })();
        await t.wait(500);
    });

test('Should get component inside server rendered root node (React 16) - GH-69', async t => {
    const labelText = ReactSelector('Label').getReact(({ state }) => state.text);

    await t.expect(labelText).eql('Label Text...');
});