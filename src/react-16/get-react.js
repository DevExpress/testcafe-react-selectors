/*global window*/

/*eslint-disable no-unused-vars*/
function getReact16 (node, fn) {
    /*eslint-enable no-unused-vars*/
    const utils = window['%testCafeReactSelectorUtils%'];

    function copyReactObject (obj) {
        var copiedObj = {};

        for (var prop in obj) {
            if (obj.hasOwnProperty(prop) && prop !== 'children')
                copiedObj[prop] = obj[prop];
        }

        return copiedObj;
    }

    function getComponentInstance (component) {
        const componentName  = window['%testCafeReactSelector%'];
        const isTag          = typeof component.type === 'string';
        let currentComponent = component;

        if (isTag) return null;

        while (componentName !== utils.getName(currentComponent) && currentComponent.return)
            currentComponent = currentComponent.return;

        const props = currentComponent.stateNode && currentComponent.stateNode.props || currentComponent.memoizedProps;
        const state = currentComponent.stateNode && currentComponent.stateNode.state || currentComponent.memoizedState;

        return { props, state };
    }

    function getComponentForDOMNode (el) {
        if (!el || !(el.nodeType === 1 || el.nodeType === 8))
            return null;

        if (window['%testCafeReactEmptyComponent%'])
            return getComponentInstance(window['%testCafeReactEmptyComponent%'].__$$reactInstance);

        for (var prop of Object.keys(el)) {
            if (!/^__reactInternalInstance/.test(prop))
                continue;

            return getComponentInstance(el[prop].return);
        }
    }

    var componentInstance = getComponentForDOMNode(node);

    if (!componentInstance)
        return null;

    delete window['%testCafeReactSelector%'];
    delete window['%testCafeReactEmptyComponent%'];

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