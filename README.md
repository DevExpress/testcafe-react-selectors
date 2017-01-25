# testcafe-react-selectors

This plugin provides selector extensions that make it easier to test ReactJS components with [TestCafe](https://github.com/DevExpress/testcafe). These extensions allow you to select page elements in a way that is native to React.

##Install

`$ npm install testcafe-react-selectors`

##Usage

####Create selectors for ReactJS components

`ReactSelector` allows you to select page elements by the name of the component class or the nested component element.
For instance, you can create React selectors as follows

```js
ReactSelector('TodoList')
ReactSelector('TodoList TodoItem')
ReactSelector('TodoItem span')
```

You can combine React selectors with testcafe `Selector` filter functions like `.withText`, `.nth` and [other](http://devexpress.github.io/testcafe/documentation/test-api/selecting-page-elements/selectors.html#functional-style-selectors).

```js
import ReactSelector from 'testcafe-react-selectors';

fixture('React application testing').page('http://localhost:1337');

test('Add new item', async t => {
    const addButton = ReactSelector('AddItemButton');

    await t.click(addButton);

    const itemLabel = ReactSelector('Label div')

    await t.expect(itemLabel.textContent).eql('New Item');
});
```

####Obtaining component's props and state

As an alternative to [testcafe snapshot properties](http://devexpress.github.io/testcafe/documentation/test-api/selecting-page-elements/dom-node-state.html), you can obtain `state` or `props` of a ReactJS component. You can use them in an assertion directly thus simplifying assertion logic.
To get these data, use the `react` property of the `ReactSelector` snapshot.
The following example illustrates how you can do this.

```js
import ReactSelector from 'testcafe-react-selectors';

fixture('React application testing').page('http://localhost:1337');

test('Add new item', async t => {
    const statusBarReact = await ReactSelector('StatusBar').react;

    await t
        .expect(statusBarReact.props.theme).eql('default');
        .expect(statusBarReact.state.text).eql('my text');
});
```

####Limitations
`testcafe-react-selectors` support ReactJS starting with version 15.
ReactSelector can only find components inherited from `React.Component`. To check if a component can be found, use the [react-dev-tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) extension.
Search for a component starts from the root React component, so selectors like `ReactSelector('body MyComponent')` will return `null`.