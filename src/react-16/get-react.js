/*global window*/

/*eslint-disable no-unused-vars*/
function getReact16 (node, fn) {
    /*eslint-enable no-unused-vars*/
    function copyReactObject (obj) {
        var copiedObj = {};

        for (var prop in obj) {
            if (obj.hasOwnProperty(prop) && prop !== 'children')
                copiedObj[prop] = obj[prop];
        }

        return copiedObj;
    }

    function getComponentForDOMNode (el) {
        let component = null;

        if (!el || !(el.nodeType === 1 || el.nodeType === 8))
            return null;

        if (window['%testCafeReactEmptyComponent%'])
            component = window['%testCafeReactEmptyComponent%'].__$$reactInstance;

        else if (window['%testCafeReactFoundComponents%'].length)
            component = window['%testCafeReactFoundComponents%'].filter(desc => desc.node === el)[0].component;

        const isTag = typeof component.type === 'string';

        if (isTag) return null;

        const props = component.stateNode && component.stateNode.props || component.memoizedProps;
        const state = component.stateNode && component.stateNode.state || component.memoizedState;

        return { props, state };
    }

    const componentInstance = getComponentForDOMNode(node);

    if (!componentInstance)
        return null;

    delete window['%testCafeReactSelector%'];
    delete window['%testCafeReactEmptyComponent%'];
    delete window['%testCafeReactFoundComponents%'];

    if (typeof fn === 'function') {
        return fn({
            state: copyReactObject(componentInstance.state),
            props: copyReactObject(componentInstance.props)
        });
    }

    return {
        state: copyReactObject(componentInstance.state),
        props: copyReactObject(componentInstance.props)
    };
}
