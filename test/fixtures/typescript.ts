/*global fixture test*/
import { ReactSelector, ReactComponent } from '../../';
import { loadApp } from '../helpers/service-util';

const REACT_VERSION = 15;

fixture`TypeScript`
    .page('http://localhost:1355')
    .beforeEach(async () => {
        await loadApp(REACT_VERSION);
    });

test('Should get DOM node by react selector', async t => {
    const listItem1 = await ReactSelector('ListItem').nth(0);
    const listItem2 = ReactSelector('ListItem').nth(1);

    type ListItemComponent = ReactComponent<{ id: string }>;

    const listItem1Id = (await listItem1.getReact()).props.id;
    const listItem2Id = listItem2.getReact < ListItemComponent > (({ props }) => props.id);

    await t
        .expect(listItem1.id).eql('l1-item1')
        .expect(listItem2.id).eql('l1-item2')

        .expect(listItem1Id).eql('l1-item1')
        .expect(listItem2Id).eql('l1-item2');
});
