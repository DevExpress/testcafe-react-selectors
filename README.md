# testcafe-react-selectors

This plugin provides selector extensions that make it easier to test ReactJS components with [TestCafe](https://github.com/DevExpress/testcafe). These extensions allow you to select page elements in a way that is native to React.

## Install

`$ npm install testcafe-react-selectors`

## Usage

#### Create selectors for ReactJS components

`ReactSelector` allows you to select page elements by the name of the component class or the nested component element.

Suppose you have the following JSX.

```xml
<TodoApp className="todo-app">
    <TodoInput />
    <TodoList>
        <TodoItem priority="High">Item 1</TodoItem>
        <TodoItem priority="Low">Item 2</TodoItem>
    </TodoList>   
    
    <div className="items-count">Items count: <span>{this.state.itemCount}</span></div>
</TodoApp>
```

To get a root DOM element for a component, pass the component name to the `ReactSelector` constructor.

```js
import { ReactSelector } from 'testcafe-react-selectors';

const todoInput = ReactSelector('TodoInput');
```

To obtain a nested component or DOM element, you can use a combined selector or add DOM element's tag name.

```js
import ReactSelector from 'testcafe-react-selectors';

const TodoList         = ReactSelector('TodoApp TodoList');
const itemsCountStatus = ReactSelector('TodoApp div');
const itemsCount       = ReactSelector('TodoApp div span');
```

Warning: if you specify a DOM element’s tag name, React selectors search for the element among the component’s children without looking into nested components. For instance, for the JSX above the `ReactSelector('TodoApp div')` selector will be equal to `Selector('.todo-app > div')`.


Selectors returned by ReactSelector( selector ) are recognized as TestCafe selectors. You can combine them with regular selectors and filter with `.withText`, `.nth`, `.find` and [other](http://devexpress.github.io/testcafe/documentation/test-api/selecting-page-elements/selectors.html#functional-style-selectors) functions. To search for elements within a component, you can use the following combined approach.

```js
import { ReactSelector } from 'testcafe-react-selectors';

var itemsCount = ReactSelector('TodoApp').find('.items-count span');
```

Let’s use the API described above to add a task to a Todo list and check that the number of items changed.

```js
import { ReactSelector } from 'testcafe-react-selectors';

fixture `TODO list test`
	.page('http://localhost:1337');

test('Add new task', async t => {
    const todoTextInput = ReactSelector('TodoInput');
    const todoItem      = ReactSelector('TodoList TodoItem');

    await t
        .typeText(todoTextInput, 'My Item')
        .pressKey('enter')
        .expect(todoItem.count).eql(3);
});
```

#### Usage with server-side rendering (SSR)

When doing SSR, e.g. with [next.js](https://github.com/zeit/next.js/) bootstrapping and re-hydration 
of react sometimes takes longer and `ReactSelector` would run even before react is ready. Use 
`waitForReact` helper to wait until react is fully bootstrapped. 

```js
import { ReactSelector, waitForReact } from 'testcafe-react-selectors';

fixture `Server rendering`
    .page `http://localhost:1355/serverRender`
    .beforeEach(async () => {
        await waitForReact({ selectReactRoot: () => document.querySelector('#__next') });
    });

test('Should get component inside server rendered root node', async t => {
    const labelText = ReactSelector('Label').getReact(({ state }) => state.text);
    await t.expect(labelText).eql('Label Text...');
});
```

#### Obtaining component's props and state

As an alternative to [testcafe snapshot properties](http://devexpress.github.io/testcafe/documentation/test-api/selecting-page-elements/dom-node-state.html), you can obtain `state` or `props` of a ReactJS component.

To obtain component properties and state, use the React selector's `.getReact()` method.

The `.getReact()` method returns a [client function](https://devexpress.github.io/testcafe/documentation/test-api/obtaining-data-from-the-client.html). This function resolves to an object that contains component's properties (excluding properties of its `children`) and state.

```js
const reactComponent      = ReactSelector('MyComponent');
const reactComponentState = await reactComponent.getReact();

// >> reactComponentState
//
// {
//     props:    <component_props>,
//     state:    <component_state>
// }
```

The returned client function can be passed to assertions activating the [Smart Assertion Query mechanism](https://devexpress.github.io/testcafe/documentation/test-api/assertions/#smart-assertion-query-mechanism).

Example

```js
import { ReactSelector } from 'testcafe-react-selectors';

fixture `TODO list test`
	.page('http://localhost:1337');

test('Check list item', async t => {
    const el         = ReactSelector('TodoList');
    const component  = await el.getReact();

    await t.expect(component.props.priority).eql('High');
    await t.expect(component.state.isActive).eql(false);
});
```

As an alternative, the `.getReact()` method can take a function that returns the required property or state. This function acts as a filter. Its argument is an object returned by `.getReact()`, i.e. `{ props: ..., state: ...}`.
```js
ReactSelector('Component').getReact(({ props, state }) => {...})
```

Example

```js
import { ReactSelector } from 'testcafe-react-selectors';

fixture `TODO list test`
    .page('http://localhost:1337');

test('Check list item', async t => {
    const el = ReactSelector('TodoList');

    await t
        .expect(el.getReact(({ props }) => props.priority)).eql('High')
        .expect(el.getReact(({ state }) => state.isActive)).eql(false);
});
```

The `.getReact()` method can be called for the `ReactSelector` or the snapshot this selector returns.

#### Limitations

* `testcafe-react-selectors` support ReactJS starting with version 15. To check if a component can be found, use the [react-dev-tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) extension.
* Search for a component starts from the root React component, so selectors like `ReactSelector('body MyComponent')` will return `null`.
* ReactSelectors need class names to select components on the page. Code minification usually does not keep the original class names. So you should either use non-minified code or configure the minificator to keep class names.
  
  For `babel-minify`, add the following options to the configuration:
    
  ```js
  { keepClassName: true, keepFnName: true }
  ```

  In UglifyJS, use the following configuration:
     
   ```js
   {
       compress: {
           keep_fnames: true
       },

       mangle: {
           keep_fnames: true
       }
   }
   ```
