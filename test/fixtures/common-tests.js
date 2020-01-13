/*global fixture test document*/
import fs from 'fs';
import { ReactSelector, waitForReact } from '../../';
import { loadApp } from '../helpers/service-util';
import { ClientFunction } from 'testcafe';

const SUPPORTED_VERSIONS = [15, 16];

/*eslint-disable no-loop-func*/
for (const version of SUPPORTED_VERSIONS) {
    fixture`ReactJS TestCafe plugin (React ${version})`
        .page`http://localhost:1355`
        .beforeEach(async () => {
            await loadApp(version);
        });

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

    test('Should get DOM node by react selector', async t => {
        const app       = ReactSelector('App');
        const list      = ReactSelector('List');
        const listItem1 = ReactSelector('ListItem').nth(0);
        const listItem2 = ReactSelector('ListItem').nth(1);

        await t
            .expect(list.count).eql(version === 16 ? 4 : 3)
            .expect(app.id).eql('app')
            .expect(listItem1.id).eql('l1-item1')
            .expect(listItem2.id).eql('l1-item2');
    });

    test('Should get DOM node by composite selector', async t => {
        const listItem1 = ReactSelector('List ListItem');
        const listItem2 = ReactSelector('List ListItem').nth(1);

        await t
            .expect(await listItem1.id).eql('l1-item1')
            .expect(await listItem2.id).eql('l1-item2');
    });

    test('Should get DOM node for stateless component', async t => {
        await t
            .expect(ReactSelector('Stateless1').textContent).ok('test')
            .expect(ReactSelector('Stateless2').exists).ok()
            .expect(ReactSelector('Stateless3').exists).ok()
            //Statless component with empty render GH-62
            .expect(ReactSelector('Stateless4').exists).ok();
    });

    test('Should get DOM node for pure component', async t => {
        await t.expect(ReactSelector('PureComponent').exists).ok();
    });

    test('Should not get DOM node for element outside react component tree', async t => {
        await t.expect(await ReactSelector.with({ timeout: 100 })('figure')).notOk();
    });

    test('Should get component state', async t => {
        const appReact        = await ReactSelector('App').getReact();
        const listItem1React  = await ReactSelector('ListItem').getReact();
        const listItem2React  = await ReactSelector('ListItem').nth(1).getReact();
        const listItem3       = await ReactSelector('ListItem').nth(2);
        const listItem3ItemId = listItem3.getReact(({ state }) => state.itemId);

        const tagReact = await ReactSelector('ListItem p').getReact();

        await t
            .expect(appReact.state).eql({ isRootComponent: true })

            .expect(listItem1React.state).eql({ itemId: 'l1-item1' })
            .expect(listItem2React.state).eql({ itemId: 'l1-item2' })

            .expect(listItem3ItemId).eql('l1-item3')

            .expect(tagReact).eql({ state: {}, props: {}, key: 'l1-item1-p' });
    });

    test('Should get component props', async t => {
        const appReact       = await ReactSelector('App').getReact();
        const listItem1React = await ReactSelector('ListItem').getReact();
        const listItem2React = await ReactSelector('ListItem').nth(1).getReact();
        const listItem3      = await ReactSelector('ListItem').nth(2);
        const listItem3Id    = listItem3.getReact(({ props }) => props.id);

        await t
            .expect(appReact.props).eql({ label: 'AppLabel' })

            .expect(listItem1React.props).eql({ id: 'l1-item1', selected: false })
            .expect(listItem2React.props).eql({ id: 'l1-item2' })

            .expect(listItem3Id).eql('l1-item3');
    });

    test('Should get component key', async t => {
        const listItem1React = await ReactSelector('ListItem').getReact();
        const listItem2React = await ReactSelector('ListItem').nth(1).getReact();
        const listItem3React = await ReactSelector('ListItem').nth(2).getReact();

        await t
            .expect(listItem1React.key).eql('ListItem1')
            .expect(listItem2React.key).eql('ListItem2')
            .expect(listItem3React.key).eql(null);

        const listItem1LiTagReact = await ReactSelector('ListItem p').getReact();
        const listItem2LiTagReact = await ReactSelector('ListItem p').nth(1).getReact();
        const listItem3LiTagReact = await ReactSelector('ListItem p').nth(2).getReact();

        await t
            .expect(listItem1LiTagReact.key).eql('l1-item1-p')
            .expect(listItem2LiTagReact.key).eql('l1-item2-p')
            .expect(listItem3LiTagReact.key).eql('l1-item3-p');
    });

    test('Should throw exception if version of React js is not supported', async t => {
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
            await t.expect(e.errMsg).contains('This module supports React version 15.x and newer');
        }
    });

    test('Should get component from wrapper component - Regression GH-11', async t => {
        await t
            .expect(ReactSelector('TextLabel').textContent).eql('Component inside of wrapper component')
            .expect(ReactSelector('WrapperComponent').textContent).eql('Component inside of wrapper component');
    });

    test('Should not get dom nodes from nested components', async t => {
        const expectedListItemCount = version === 16 ? 12 : 9;

        await t
            .expect(ReactSelector('ListItem p').count).eql(expectedListItemCount)
            .expect(ReactSelector('List p').count).eql(0)
            .expect(ReactSelector('App ListItem').count).eql(expectedListItemCount);
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
            .expect(pureComponent2.exists).ok()
            .expect(portal.findReact('List').exists).ok();

        if (version === 16) {
            await t
                .expect(ReactSelector('PortalReact16').exists).ok()
                .expect(ReactSelector('PortalReact16 List').exists).ok()
                .expect(ReactSelector('PortalReact16 ListItem').count).eql(3)
                .expect(ReactSelector('PortalReact16').findReact('List').exists).ok()
                .expect(ReactSelector('PortalReact16').findReact('ListItem').exists).ok()
                .expect(ReactSelector('PortalReact16').findReact('List ListItem').exists).ok()
                .expect(ReactSelector('PortalReact16').findReact('List').findReact('ListItem').exists).ok()
                .expect(ReactSelector('PortalReact16').findReact('PortalReact16').exists).notOk();
        }
    });

    test('Should get new values of props and state after they were changed GH-71', async t => {
        const list               = ReactSelector('List');
        const isListActive       = list.getReact(({ state }) => state.isActive);
        const isListItemSelected = ReactSelector('ListItem').getReact(({ props }) => props.selected);

        await t
            .expect(isListActive).eql(false)
            .expect(isListItemSelected).eql(false)

            //NOTE change List state and ListItem props
            .click(list)
            .expect(isListActive).eql(true)
            .expect(isListItemSelected).eql(true);
    });

    test('Should get new values of props after they were changed in stateless components GH-74', async t => {
        const componentCont    = ReactSelector('SmartComponent');
        const statelessComp    = ReactSelector('SmartComponent Stateless1');
        const text             = statelessComp.getReact(({ props }) => props.text);
        //NOTE test the getting props after the filtration
        const textPropDisabled = statelessComp.withText('Disabled').getReact(({ props }) => props.text);
        const textPropEnabled  = statelessComp.withText('Enabled').getReact(({ props }) => props.text);

        await t
            .expect(text).eql('Disabled')
            .expect(textPropDisabled).eql('Disabled')

            .click(componentCont)

            .expect(text).eql('Enabled')
            .expect(textPropEnabled).eql('Enabled');
    });

    test('Should filter components by props (withProps method) - exact matching', async t => {
        const el     = ReactSelector('UnfilteredSet SetItem');
        let elSet    = el.withProps({ prop1: true }, { exactObjectMatch: true });
        let elSubSet = elSet.withProps({ prop2: { enabled: true } }, { exactObjectMatch: true });

        await t
            .expect(el.count).eql(5)
            .expect(elSet.count).eql(3)
            .expect(elSubSet.count).eql(1);

        elSet    = el.withProps('prop1', true, { exactObjectMatch: true });
        elSubSet = elSet.withProps('prop2', { enabled: true }, { exactObjectMatch: true });

        await t
            .expect(elSet.count).eql(3)
            .expect(elSubSet.count).eql(1);

        const circularDeps = { field: null };

        circularDeps.field = circularDeps;

        const nonExistingSubset1 = el.withProps({ foo: 'bar' }, { exactObjectMatch: true });
        const nonExistingSubset2 = el.withProps({
            foo: function () {
            },

            prop1: true
        }, { exactObjectMatch: true });
        const nonExistingSubset3 = el.withProps({
            prop1: true,
            prop2: { enabled: true, width: void 0 }
        }, { exactObjectMatch: true });

        const nonExistingSubset4 = el.withProps({
            prop1: true,
            prop2: [{ enabled: true }]
        }, { exactObjectMatch: true });

        const nonExistingSubset5 = el.withProps(circularDeps, { exactObjectMatch: true });

        await t
            .expect(nonExistingSubset1.count).eql(0)
            .expect(nonExistingSubset2.count).eql(0)
            .expect(nonExistingSubset3.count).eql(0)
            .expect(nonExistingSubset4.count).eql(0)
            .expect(nonExistingSubset5.count).eql(0);
    });

    test('Should filter components by props (withProps method) - partial matching', async t => {
        const el = ReactSelector('UnfilteredSet_PartialMatching SetItem');

        const subSet1 = el.withProps({
            prop1: {
                obj: { field1: 1 }
            }
        });

        const subSet2 = el.withProps({
            prop1: {
                obj: { field2: 0 }
            }
        });

        const subSet3 = el.withProps({
            prop1: {
                obj: {
                    field1:           2,
                    notExistingField: true
                }
            }
        });

        await t
            .expect(subSet1.count).eql(3)
            .expect(subSet2.count).eql(1)
            .expect(subSet3.count).eql(0);

        const subSetLevel2Partial = el.withProps({
            prop1: {
                obj: {
                    field3: {
                        subField1: 1
                    }
                }
            }
        });

        const subSetLevel2Exact = el.withProps({
            prop1: {
                obj: {
                    field3: {
                        subField1: 1,
                        subField2: 0
                    }
                }
            }
        });

        await t
            .expect(subSetLevel2Partial.count).eql(3)
            .expect(subSetLevel2Exact.count).eql(1);
    });

    test('Should filter components by props (withProps method) - errors', async t => {
        const el = ReactSelector('List');

        const nonObjectValues = [null, false, void 0, 42, 'prop', []];
        const nonStringValues = [null, false, void 0, 42, []];

        for (const props of nonObjectValues) {
            try {
                await el.withProps(props).with({ timeout: 10 })();
            }
            catch (e) {
                await t.expect(e.errMsg).contains(`Error: The "props" option value is expected to be a non-null object, but it is ${typeof props}.`);
            }
        }

        for (const props of nonStringValues) {
            try {
                await el.withProps(props, 'value').with({ timeout: 10 })();
            }
            catch (e) {
                await t.expect(e.errMsg).contains(`Error: The first argument is expected to be a property name string or a "props" non-null object, but it is ${typeof props}.`);
            }
        }

        for (const options of nonObjectValues) {
            try {
                await el.withProps('prop', 'value', options).with({ timeout: 10 })();
            }
            catch (e) {
                await t.expect(e.errMsg).contains(`Error: The "options" value is expected to be an object, but it is ${typeof options}.`);
            }
        }

        for (const options of nonObjectValues) {
            try {
                await el.withProps({ prop: 'value' }, options).with({ timeout: 10 })();
            }
            catch (e) {
                await t.expect(e.errMsg).contains(`Error: The "options" value is expected to be an object, but it is ${typeof options}.`);
            }
        }
    });

    test('Should filter components by key', async t => {
        const expectedItemCount = version === 15 ? 3 : 4;
        const listItemsByKey    = ReactSelector('ListItem').withKey('ListItem1');
        const emptySet1         = ReactSelector('ListItem').withKey(void 0);
        const emptySet2         = ReactSelector('ListItem').withKey(null);

        await t
            .expect(listItemsByKey.count).eql(expectedItemCount)
            .expect(emptySet1.count).eql(0)
            .expect(emptySet2.count).eql(0)
            .expect(ReactSelector('Portal').withKey('portal').count).eql(1)

            .expect(listItemsByKey.withProps({ selected: false }).count).eql(expectedItemCount)
            .click(listItemsByKey)

            .expect(listItemsByKey.withProps({ selected: false }).count).eql(expectedItemCount - 1)
            .expect(listItemsByKey.withProps({ selected: true }).count).eql(1);

        if (version === 16)
            await t.expect(ReactSelector('PortalReact16').withKey('portalReact16').count).eql(1);
    });

    test('Should find subcomponents (findReact methods)', async t => {
        const smartComponent = ReactSelector('App').findReact('SmartComponent');
        const textLabel      = ReactSelector('App').findReact('WrapperComponent TextLabel');
        const list           = ReactSelector('List');
        const listItems      = list.findReact('ListItem');

        const paragraphs1     = listItems.findReact('li p');
        const paragraphs2     = listItems.findReact('p');
        const expectedElCount = version === 16 ? 12 : 9;

        await t
            .expect(smartComponent.exists).ok()
            .expect(textLabel.exists).ok()

            .expect(listItems.count).eql(expectedElCount)
            .expect(paragraphs1.count).eql(expectedElCount)
            .expect(paragraphs2.count).eql(expectedElCount);
    });

    test('Should find subcomponents (findReact methods) - errors', async t => {
        for (const selector of [null, false, void 0, {}, 42]) {
            try {
                await ReactSelector('app').findReact(selector);
            }
            catch (e) {
                await t.expect(e.errMsg).contains(`Selector option is expected to be a string, but it was ${typeof selector}.`);
            }
        }
    });

    test('Should find subcomponents (combining findReact and withProps)', async t => {
        const spanText     = 'SetItem2';
        const el           = ReactSelector('SetItem');
        const elSet        = el.withProps({ prop1: true });
        const subEl        = elSet.findReact('span');
        const subElByProps = el.findReact('SetItemLabel').withProps('text', spanText);
        const actualText   = subElByProps.getReact(({ props }) => props.text);

        await t
            .expect(elSet.count).eql(3)
            .expect(subEl.count).eql(2)
            .expect(subEl.tagName).eql('span')
            .expect(el.findReact('SetItemLabel').count).eql(3)
            .expect(subElByProps.count).eql(1)
            .expect(actualText).eql(spanText);
    });

    test('Should find react components inside of filtered Selector set GH-97', async t => {
        await t
            .expect(ReactSelector('List').withText('List: l2').findReact('ListItem').id).eql('l2-item1')
            .expect(ReactSelector('App').find('div').exists).ok()
            .expect(ReactSelector('App').find('div').findReact('ListItem').exists).ok()
            .expect(ReactSelector('App').find('div').findReact('ListItem').count).eql(6)
            .expect(ReactSelector('App').find('*').findReact('ListItem').count).eql(6)
            .expect(ReactSelector('App').find('div').findReact('ListItem').id).eql('l1-item1');

        const componentCont = ReactSelector('SmartComponent');
        const statelessComp = componentCont.findReact('Stateless1');
        const text          = statelessComp.getReact(({ props }) => props.text);

        await t
            .expect(text).eql('Disabled')

            .click(componentCont)
            .expect(text).eql('Enabled')

            .click(componentCont)
            .expect(text).eql('Disabled');
    });

    test('waitForReact should work from a node callback', async t => {
        fs.exists('../../packpage.json', async () => {
            await waitForReact(1e4, t);
        });
    });

    test('Should get memoized component', async t => {
        if (version === 16) {
            const Memoized = ReactSelector('Memoized');
            const text = Memoized.getReact(({ props }) => props.text);

            await t
                .expect(ReactSelector('Memoized').exists).ok()
                .expect(text).eql('Memo');
        }
    });

    test('Should find react components inside nested react app', async t => {
        await t
            .expect(ReactSelector('NestedApp Stateless1').withText('Inside nested app').exists).ok();
    });

    fixture`ReactJS TestCafe plugin (the app loads during test) (React ${version})`
        .page`http://localhost:1355`;

    test('Should search inside of stateless root GH-33', async t => {
        const expectedText = 'PureComponent';

        await t.navigateTo('/stateless-root.html');
        await loadApp(version);
        await waitForReact();

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
        await waitForReact();

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
            .expect(component1React).eql({ state: {}, props: {}, key: null })
            .expect(component2React).eql({ state: {}, props: {}, key: null });
    });

    test('Should throw exception if there is no React on the tested page', async t => {
        await t.navigateTo('./noReact');

        try {
            await ReactSelector('body');
        }
        catch (e) {
            await t.expect(e.errMsg).contains('This module supports React version 15.x and newer');
        }
    });
}
/*eslint-enable no-loop-func*/
