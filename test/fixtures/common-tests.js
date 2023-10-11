/*global fixture test */
import { ReactSelector } from '../../';

const SUPPORTED_VERSIONS = [16, 17, 18];

/*eslint-disable no-loop-func*/
for (const version of SUPPORTED_VERSIONS) {
    fixture `ReactJS TestCafe plugin (React ${version})`
        .page`http://localhost:3000/index-react-${version}.html`;

    test('Should throw exception for non-valid selectors', async t => {
        for (const selector of [null, false, void 0, {}, 42]) {
            try {
                await ReactSelector(selector);
            }
            catch (e) {
                await t.expect(e.errMsg).contains(`Selector option is expected to be a string, but it was ${typeof selector}.`);
            }
        }
    });
}
/*eslint-enable no-loop-func*/
