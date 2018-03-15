/*global fixture test*/
import { ReactSelector } from '../../';
import { loadApp } from '../helpers/service-util';

const REACT_VERSION = 15;

fixture `TypeScript`
    .page('http://localhost:1355')
    .beforeEach(async () => {
        await loadApp(REACT_VERSION);
    });

test('Should get DOM node by react selector', async t => {
    var listItem1 = await ReactSelector('ListItem').nth(0);
    var listItem2 = ReactSelector('ListItem').nth(1);

    var listItem1Id = (await listItem1.getReact()).props.id;
    var listItem2Id = listItem2.getReact(({ props }) => props.id);

    await t
        .expect(listItem1.id).eql('l1-item1')
        .expect(listItem2.id).eql('l1-item2')

        .expect(listItem1Id).eql('l1-item1')
        .expect(listItem2Id).eql('l1-item2');
});