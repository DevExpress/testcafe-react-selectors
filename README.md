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
import ReactSelector from 'testcafe-react-selectors';

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
import ReactSelector from 'testcafe-react-selectors';

var itemsCount = ReactSelector('TodoApp').find('.items-count span');
```

Let’s use the API described above to add a task to a Todo list and check that the number of items changed.

```js
import ReactSelector from 'testcafe-react-selectors';

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

#### Obtaining component's props and state

As an alternative to [testcafe snapshot properties](http://devexpress.github.io/testcafe/documentation/test-api/selecting-page-elements/dom-node-state.html), you can obtain `state` or `props` of a ReactJS component. You can use them in an assertion directly thus simplifying assertion logic.

To obtain component properties and state, use the React selector’s `.getReact()` method.

If you call this method with zero parameters, it returns an object of the following structure.
```js
{
    props: <component_props>,
    state: <component_state>
}

```

Where `props` are React component properties excluding properties of its `children`, `state` – the state of the component.

Example

```js
import ReactSelector from 'testcafe-react-selectors';

fixture `TODO list test`
	.page('http://localhost:1337');

test('Check list item', async t => {
    const el = ReactSelector('TodoList');

    await t.expect(el.getReact().props.priority).eql('High');
    await t.expect(el.getReact().state.isActive).eql(false);
});
```

As an alternative, the `.getReact()` method can take a function that returns the required property or state. This function acts as a filter. Its argument is an object returned by `.getReact()`, i.e. `{ props: ..., state: ...}`.
```js
ReactSelector('Component').getReact(({ props, state }) => {...})
```

Example

```js
import ReactSelector from 'testcafe-react-selectors';

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
`testcafe-react-selectors` support ReactJS starting with version 15.
ReactSelector can only find components inherited from `React.Component`. To check if a component can be found, use the [react-dev-tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) extension.
Search for a component starts from the root React component, so selectors like `ReactSelector('body MyComponent')` will return `null`.