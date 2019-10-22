/*global window Node*/
(function () {
    const ELEMENT_NODE = 1;
    const COMMENT_NODE = 8;

    function copyReactObject (obj) {
        var copiedObj = {};

        for (var prop in obj) {
            if (obj.hasOwnProperty(prop) && prop !== 'children')
                copiedObj[prop] = obj[prop];
        }

        return copiedObj;
    }

    function getComponentForDOMNode (el) {
        if (!el || !(el.nodeType === ELEMENT_NODE || el.nodeType === COMMENT_NODE)) return null;

        let component             = null;
        const emptyComponentFound = window['%testCafeReactEmptyComponent%'] &&
                                    window['%testCafeReactEmptyComponent%'].length;

        if (emptyComponentFound && el.nodeType === COMMENT_NODE)
            component = window['%testCafeReactEmptyComponent%'].shift().__$$reactInstance;

        else if (window['%testCafeReactFoundComponents%'].length)
            component = window['%testCafeReactFoundComponents%'].filter(desc => desc.node === el)[0].component;

        const props = component.stateNode && component.stateNode.props || component.memoizedProps;
        const state = component.stateNode && component.stateNode.state || component.memoizedState;
        const key   = component.key;

        return { props, state, key };
    }

    /*eslint-enable no-unused-vars*/
    function getReact (node, fn) {
        /*eslint-disable no-unused-vars*/
        const componentInstance = getComponentForDOMNode(node);

        if (!componentInstance) return null;

        delete window['%testCafeReactSelector%'];
        delete window['%testCafeReactEmptyComponent%'];
        delete window['%testCafeReactFoundComponents%'];

        if (typeof fn === 'function') {
            return fn({
                state: copyReactObject(componentInstance.state),
                props: copyReactObject(componentInstance.props),
                key:   componentInstance.key
            });
        }

        return {
            state: copyReactObject(componentInstance.state),
            props: copyReactObject(componentInstance.props),
            key:   componentInstance.key
        };
    }

    function scanDOMNodeForReactInstance (el) {
        if (!el || !(el.nodeType === ELEMENT_NODE || el.nodeType === COMMENT_NODE)) return null;

        if (el.nodeType === COMMENT_NODE)
            return el.__$$reactInstance.return.child;

        for (var prop of Object.keys(el)) {
            if (!/^__reactInternalInstance/.test(prop)) continue;

            let nestedComponent = el[prop];

            if (typeof nestedComponent.type !== 'string')
                return nestedComponent;

            let parentComponent = nestedComponent;

            do {
                nestedComponent = parentComponent;
                parentComponent = nestedComponent.return;
            } while (parentComponent && parentComponent.type && !(parentComponent.stateNode instanceof Node));

            return nestedComponent;
        }

        return null;
    }

    function getRenderedComponentVersion (component, rootInstances) {
        if (!component.alternate) return component;

        let component1 = component;
        let component2 = component.alternate;

        while (component1.return) component1 = component1.return;
        while (component2.return) component2 = component2.return;

        if (rootInstances.indexOf(component1) > -1) return component;

        return component.alternate;
    }

    function scanDOMNodeForReactComponent (domNode) {
        const rootInstances = window['$testCafeReact16Roots'].map(rootEl => rootEl.return || rootEl);
        const reactInstance = scanDOMNodeForReactInstance(domNode);

        return getRenderedComponentVersion(reactInstance, rootInstances);
    }

    function getFoundComponentInstances () {
        return window['%testCafeReactFoundComponents%'].map(desc => desc.component);
    }

    function getComponentKey (instance) {
        return instance.key;
    }

    return { getReact, getComponentForDOMNode, scanDOMNodeForReactComponent, getFoundComponentInstances, getComponentKey };
})();
