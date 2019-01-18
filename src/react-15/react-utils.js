/*global window*/
(function () {
    const ELEMENT_NODE = 1;
    const COMMENT_NODE = 8;
    const utils        = window['%testCafeReactSelectorUtils%'];

    function copyReactObject (obj) {
        var copiedObj = {};

        for (var prop in obj) {
            if (obj.hasOwnProperty(prop) && prop !== 'children')
                copiedObj[prop] = obj[prop];
        }

        return copiedObj;
    }

    function getComponentInstance (component) {
        const parent               = component._hostParent || component;
        const renderedChildren     = parent._renderedChildren || { _: component._renderedComponent } || {};
        const renderedChildrenKeys = Object.keys(renderedChildren);
        const componentName        = window['%testCafeReactSelector%'];

        for (let index = 0; index < renderedChildrenKeys.length; ++index) {
            const key             = renderedChildrenKeys[index];
            let renderedComponent = renderedChildren[key];
            let componentInstance = null;

            while (renderedComponent) {
                if (componentName === utils.getName(renderedComponent))
                    componentInstance = renderedComponent._instance || renderedComponent._currentElement;

                if (renderedComponent._domID === component._domID)
                    return componentInstance;

                renderedComponent = renderedComponent._renderedComponent;
            }
        }

        return null;
    }

    function getComponentForDOMNode (el) {
        if (!el || !(el.nodeType === ELEMENT_NODE || el.nodeType === COMMENT_NODE))
            return null;

        const isRootNode    = el.hasAttribute && el.hasAttribute('data-reactroot');
        const componentName = window['%testCafeReactSelector%'];

        if (isRootNode) {
            const rootComponent = utils.getRootComponent(el);

            //NOTE: check if it's not a portal component
            if (utils.getName(rootComponent) === componentName)
                return rootComponent._instance;

            return getComponentInstance(rootComponent);
        }

        for (var prop of Object.keys(el)) {
            if (!/^__reactInternalInstance/.test(prop))
                continue;

            return getComponentInstance(el[prop]);
        }
    }

    function getComponentKey (component) {
        const currentElement = component._reactInternalInstance ? component._reactInternalInstance._currentElement : component;

        return currentElement.key;
    }

    /*eslint-disable no-unused-vars*/
    function getReact (node, fn) {
        /*eslint-enable no-unused-vars*/
        const componentInstance = getComponentForDOMNode(node);

        if (!componentInstance) return null;

        delete window['%testCafeReactSelector%'];

        if (typeof fn === 'function') {
            return fn({
                state: copyReactObject(componentInstance.state),
                props: copyReactObject(componentInstance.props),
                key:   getComponentKey(componentInstance)
            });
        }

        return {
            state: copyReactObject(componentInstance.state),
            props: copyReactObject(componentInstance.props),
            key:   getComponentKey(componentInstance)
        };
    }

    function getFoundComponentInstances () {
        return window['%testCafeReactFoundComponents%'].map(desc => desc.component);
    }

    function scanDOMNodeForReactComponent (el) {
        if (!el || !(el.nodeType === ELEMENT_NODE || el.nodeType === COMMENT_NODE))
            return null;

        let component = null;

        for (const prop of Object.keys(el)) {
            if (!/^__reactInternalInstance/.test(prop))
                continue;

            component = el[prop];

            break;
        }

        if (!component) return null;

        const parent = component._hostParent;

        if (!parent) return component;

        const renderedChildren     = parent._renderedChildren;
        const renderedChildrenKeys = Object.keys(renderedChildren);

        const currentElementId = renderedChildrenKeys.filter(key => {
            const renderedComponent = renderedChildren[key];

            return renderedComponent && renderedComponent.getHostNode() === el;
        })[0];

        return renderedChildren[currentElementId];
    }

    return { getReact, getComponentForDOMNode, scanDOMNodeForReactComponent, getFoundComponentInstances, getComponentKey };
})();

