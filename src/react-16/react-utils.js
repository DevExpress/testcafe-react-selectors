/*global window*/
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

        const isTag = typeof component.type === 'string';

        if (isTag) return null;

        const props = component.stateNode && component.stateNode.props || component.memoizedProps;
        const state = component.stateNode && component.stateNode.state || component.memoizedState;

        return { props, state };
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
                props: copyReactObject(componentInstance.props)
            });
        }

        return {
            state: copyReactObject(componentInstance.state),
            props: copyReactObject(componentInstance.props)
        };
    }

    function getFoundComponentInstances () {
        return window['%testCafeReactFoundComponents%'].map(desc => desc.component);
    }

    return { getReact, getComponentForDOMNode, getFoundComponentInstances };
})();
