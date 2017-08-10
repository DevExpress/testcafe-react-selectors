/*global fixture test document*/
import ReactSelector from '../../';
import { ClientFunction } from 'testcafe';

fixture('ReactJS TestCafe plugin').page('http://localhost:1355');

test('Should throw exception for non-valid selectors', async t => {
    for (var selector of [null, false, void 0, {}, 42]) {
        try {
            await ReactSelector(selector);
        }
        catch (e) {
            await t.expect(e.errMsg).contains(`Selector option is expected to be a string, but it was ${typeof selector}.`);
        }
    }
});

test('Should get DOM node by react selector', async t => {
    var app = await ReactSelector('App');

    var listItem1 = ReactSelector('ListItem').nth(0);
    var listItem2 = ReactSelector('ListItem').nth(1);

    await t
        .expect(await app.id).eql('app')
        .expect(await listItem1.id).eql('l1-item1')
        .expect(await listItem2.id).eql('l1-item2');
});

test('Should get DOM node by composite selector', async t => {
    var listItem1 = ReactSelector('List ListItem');
    var listItem2 = ReactSelector('List ListItem').nth(1);

    await t
        .expect(await listItem1.id).eql('l1-item1')
        .expect(await listItem2.id).eql('l1-item2');
});

test('Should get DOM node for stateless component', async t => {
    var stateless1 = await ReactSelector('Stateless1');
    var stateless2 = await ReactSelector('Stateless2');
    var stateless3 = await ReactSelector('Stateless3');

    await t.expect(stateless1.textContent).ok('test');
    await t.expect(stateless2).ok();
    await t.expect(stateless3).ok();
});

test('Should get DOM node for pure component', async t => {
    var pureComponent = await ReactSelector('PureComponent');

    await t.expect(pureComponent).ok();
});

test('Should not get DOM node for element outside react component tree ', async t => {
    await t.expect(await ReactSelector.with({ timeout: 100 })('figure')).notOk();
});

test('Should get component state', async t => {
    var listItem1React  = await ReactSelector('ListItem').getReact();
    var listItem2React  = await ReactSelector('ListItem').nth(1).getReact();
    var listItem3       = await ReactSelector('ListItem').nth(2);
    var listItem3ItemId = listItem3.getReact(({ state }) => state.itemId);

    var tagReact = await ReactSelector('ListItem p').getReact();

    await t
        .expect(listItem1React.state).eql({ itemId: 'l1-item1' })
        .expect(listItem2React.state).eql({ itemId: 'l1-item2' })

        .expect(listItem3ItemId).eql('l1-item3')

        .expect(tagReact).notOk();
});

test('Should get component props', async t => {
    var listItem1React = await ReactSelector('ListItem').getReact();
    var listItem2React = await ReactSelector('ListItem').nth(1).getReact();
    var listItem3      = await ReactSelector('ListItem').nth(2);
    var listItem3Id    = listItem3.getReact(({ props }) => props.id);

    await t
        .expect(listItem1React.props).eql({ id: 'l1-item1' })
        .expect(listItem2React.props).eql({ id: 'l1-item2' })
        .expect(listItem3Id).eql('l1-item3');
});

test('Should throw exception if version of React js is not supported', async t => {
    await ClientFunction(() => {
        const reactRoot         = document.querySelector('[data-reactroot]');
        const internalReactProp = Object.keys(reactRoot).filter(prop => /^__reactInternalInstance/.test(prop))[0];

        delete reactRoot[internalReactProp];
    })();

    try {
        await ReactSelector('App');
    }
    catch (e) {
        await t.expect(e.errMsg).contains('testcafe-react-selectors supports React version 15.x and newer');
    }
});

test('Should throw exception if there is no React on the tested page', async t => {
    await t.navigateTo('./noReact');

    try {
        await ReactSelector('body');
    }
    catch (e) {
        await t.expect(e.errMsg).contains('testcafe-react-selectors supports React version 15.x and newer');
    }
});

test('Should get component from wrapper component - Regression GH-11', async t => {
    await t.expect(ReactSelector('TextLabel').textContent).eql('Component inside of wrapper component');
    await t.expect(ReactSelector('WrapperComponent').textContent).eql('Component inside of wrapper component');
});

test('Should not get dom nodes from nested components', async t => {
    await t.expect(ReactSelector('ListItem p').count).eql(9);
    await t.expect(ReactSelector('List p').count).eql(0);
    await t.expect(ReactSelector('App ListItem').count).eql(9);
});

test('Should get props and state from components with common DOM node - Regression GH-15', async t => {
    await t.expect(ReactSelector('WrapperComponent')
        .getReact(({ props, state }) => {
            return { direction: props.direction, width: state.width };
        }))
        .eql({ direction: 'horizontal', width: 100 });

    await t.expect(ReactSelector('TextLabel')
        .getReact(({ props, state }) => {
            return { color: props.color, text: state.text };
        }))
        .eql({ color: '#fff', text: 'Component inside of wrapper component' });
});

test('Should get the component with empty output', async t => {
    const component = await ReactSelector('EmptyComponent');

    await t.expect(component.getReact(({ state }) => state.id)).eql(1);
});

test('Should search inside of portal component', async t => {
    const portal         = ReactSelector('Portal');
    const list           = ReactSelector('Portal List');
    const listItem       = ReactSelector('Portal ListItem');
    const listId         = await list.getReact(({ props }) => props.id);
    const pureComponent1 = ReactSelector('PortalWithPureComponent PureComponent');
    const pureComponent2 = ReactSelector('PureComponent');

    await t
        .expect(portal.exists).ok()
        .expect(list.exists).ok()
        .expect(listItem.exists).ok()
        .expect(listId).eql('l3')
        .expect(pureComponent1.exists).ok()
        .expect(pureComponent2.exists).ok();
});
