/*global fixture test document*/
import ReactSelector from '../../';
import { loadApp } from '../helpers/service-util';
import { ClientFunction } from 'testcafe';

const SUPPORTED_VERSIONS = [15, 16];

/*eslint-disable no-loop-func*/
for (const version of SUPPORTED_VERSIONS) {
    fixture `ReactJS TestCafe plugin (React ${version})`
        .page `http://localhost:1355`
        .beforeEach(async () => {
            await loadApp(version);
        });

    test(`Should throw exception for non-valid selectors`, async t => {
        for (var selector of [null, false, void 0, {}, 42]) {
            try {
                await ReactSelector(selector);
            }
            catch (e) {
                await t.expect(e.errMsg).contains(`Selector option is expected to be a string, but it was ${typeof selector}.`);
            }
        }
    });

    test(`Should get DOM node by react selector`, async t => {
        var app = await ReactSelector('App');

        var listItem1 = ReactSelector('ListItem').nth(0);
        var listItem2 = ReactSelector('ListItem').nth(1);

        await t
            .expect(await app.id).eql('app')
            .expect(await listItem1.id).eql('l1-item1')
            .expect(await listItem2.id).eql('l1-item2');
    });

    test(`Should get DOM node by composite selector`, async t => {
        var listItem1 = ReactSelector('List ListItem');
        var listItem2 = ReactSelector('List ListItem').nth(1);

        await t
            .expect(await listItem1.id).eql('l1-item1')
            .expect(await listItem2.id).eql('l1-item2');
    });

    test(`Should get DOM node for stateless component`, async t => {
        await t
            .expect(ReactSelector('Stateless1').textContent).ok('test')
            .expect(ReactSelector('Stateless2').exists).ok()
            .expect(ReactSelector('Stateless3').exists).ok()
            //Statless component with empty render GH-62
            .expect(ReactSelector('Stateless4').exists).ok();
    });

    test(`Should get DOM node for pure component`, async t => {
        await t.expect(ReactSelector('PureComponent').exists).ok();
    });

    test(`Should not get DOM node for element outside react component tree `, async t => {
        await t.expect(await ReactSelector.with({ timeout: 100 })('figure')).notOk();
    });

    test(`Should get component state`, async t => {
        const appReact        = await ReactSelector('App').getReact();
        const listItem1React  = await ReactSelector('ListItem').getReact();
        const listItem2React  = await ReactSelector('ListItem').nth(1).getReact();
        const listItem3       = await ReactSelector('ListItem').nth(2);
        const listItem3ItemId = listItem3.getReact(({ state }) => state.itemId);

        var tagReact = await ReactSelector('ListItem p').getReact();

        await t
            .expect(appReact.state).eql({ isRootComponent: true })

            .expect(listItem1React.state).eql({ itemId: 'l1-item1' })
            .expect(listItem2React.state).eql({ itemId: 'l1-item2' })

            .expect(listItem3ItemId).eql('l1-item3')

            .expect(tagReact).notOk();
    });

    test(`Should get component props`, async t => {
        var appReact       = await ReactSelector('App').getReact();
        var listItem1React = await ReactSelector('ListItem').getReact();
        var listItem2React = await ReactSelector('ListItem').nth(1).getReact();
        var listItem3      = await ReactSelector('ListItem').nth(2);
        var listItem3Id    = listItem3.getReact(({ props }) => props.id);

        await t
            .expect(appReact.props).eql({ label: 'AppLabel' })

            .expect(listItem1React.props).eql({ id: 'l1-item1' })
            .expect(listItem2React.props).eql({ id: 'l1-item2' })

            .expect(listItem3Id).eql('l1-item3');
    });

    test(`Should throw exception if version of React js is not supported`, async t => {
        await ClientFunction(() => {
            let reactRoot         = null;
            let internalReactProp = null;

            if (version === 15) {
                reactRoot         = document.querySelector('[data-reactroot]');
                internalReactProp = Object.keys(reactRoot).filter(prop => /^__reactInternalInstance/.test(prop))[0];
            }
            else {
                reactRoot         = document.querySelector('#app-container');
                internalReactProp = '_reactRootContainer';
            }

            delete reactRoot[internalReactProp];
        }, { dependencies: { version } })();

        try {
            await ReactSelector('App');
        }
        catch (e) {
            await t.expect(e.errMsg).contains('testcafe-react-selectors supports React version 15.x and newer');
        }
    });

    test(`Should throw exception if there is no React on the tested page`, async t => {
        await t.navigateTo('./noReact');

        try {
            await ReactSelector('body');
        }
        catch (e) {
            await t.expect(e.errMsg).contains('testcafe-react-selectors supports React version 15.x and newer');
        }
    });

    test(`Should get component from wrapper component - Regression GH-11`, async t => {
        await t
            .expect(ReactSelector('TextLabel').textContent).eql('Component inside of wrapper component')
            .expect(ReactSelector('WrapperComponent').textContent).eql('Component inside of wrapper component');
    });

    test(`Should not get dom nodes from nested components`, async t => {
        const expectedListItemCount = version === 16 ? 12 : 9;

        await t
            .expect(ReactSelector('ListItem p').count).eql(expectedListItemCount)
            .expect(ReactSelector('List p').count).eql(0)
            .expect(ReactSelector('App ListItem').count).eql(expectedListItemCount);
    });

    test(`Should get props and state from components with common DOM node - Regression GH-15`, async t => {
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

    test(`Should get the component with empty output`, async t => {
        const component = await ReactSelector('EmptyComponent');

        await t.expect(component.getReact(({ state }) => state.id)).eql(1);
    });

    test(`Should search inside of portal component`, async t => {
        const portal         = ReactSelector('Portal');
        const portalWidth    = await portal.getReact(({ state }) => state.width);
        const list           = ReactSelector('Portal List');
        const listItem       = ReactSelector('Portal ListItem');
        const listId         = await list.getReact(({ props }) => props.id);
        const pureComponent1 = ReactSelector('PortalWithPureComponent PureComponent');
        const pureComponent2 = ReactSelector('PureComponent');

        await t
            .expect(portal.exists).ok()
            .expect(portalWidth).eql(100)
            .expect(list.exists).ok()
            .expect(listItem.exists).ok()
            .expect(listId).eql('l3')
            .expect(pureComponent1.exists).ok()
            .expect(pureComponent2.exists).ok();

        if (version === 16) {
            await t
                .expect(ReactSelector('PortalReact16').exists).ok()
                .expect(ReactSelector('PortalReact16 List').exists).ok()
                .expect(ReactSelector('PortalReact16 ListItem').count).eql(3);
        }
    });

    test(`Should search inside of stateless root GH-33`, async t => {
        const expectedText = 'PureComponent';

        await t.navigateTo('/stateless-root.html');
        await loadApp(version);


        let App        = ReactSelector('App');
        let component1 = ReactSelector('App PureComponent');
        let component2 = ReactSelector('PureComponent');
        let appTitle   = App.getReact(({ props }) => props.text);
        const text1    = component1.getReact(({ state }) => state.text);
        const text2    = component2.getReact(({ state }) => state.text);

        await t
            .expect(App.exists).ok()
            .expect(component1.exists).ok()
            .expect(component2.exists).ok()
            .expect(appTitle).eql('AppTitle')
            .expect(text1).eql(expectedText)
            .expect(text2).eql(expectedText);

        await t.navigateTo('/root-pure-component.html');
        await loadApp(version);

        App                   = ReactSelector('App');
        component1            = ReactSelector('App PureComponent');
        component2            = ReactSelector('PureComponent');
        appTitle              = App.getReact(({ props }) => props.text);
        const text            = App.getReact(({ state }) => state.text);
        const component1React = component1.getReact();
        const component2React = component2.getReact();

        await t
            .expect(App.exists).ok()
            .expect(component1.exists).ok()
            .expect(component2.exists).ok()
            .expect(appTitle).eql('AppTitle')
            .expect(text).eql(expectedText)
            .expect(component1React).eql({ state: {}, props: {} })
            .expect(component2React).eql({ state: {}, props: {} });
    });

    if (version === 16) {
        test('Server rendering React 16 - GH-69', async t => {
            await t.navigateTo('http://localhost:1355/serverRender');
            //NOTE: wait for client side initialization
            await t.wait(200);

            const labelText = ReactSelector('Label').getReact(({ state }) => state.text);

            await t.expect(labelText).eql('Label Text...');
        });
    }
}
/*eslint-enable no-loop-func*/