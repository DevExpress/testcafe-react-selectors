/*global document window*/
var Selector = require('testcafe').Selector;

export default Selector(selector => {
    var rootEls               = document.querySelectorAll('[data-reactroot]');
    var supportedReactVersion = rootEls.length &&
                                Object.keys(rootEls[0]).some(prop => /^__reactInternalInstance/.test(prop));

    if (!supportedReactVersion)
        throw new Error('testcafe-react-selectors supports React version 15.x and newer');

    function getName (component) {
        if (!component.getName)
            return component._tag;

        let name = component.getName();

        //NOTE: getName() returns null in IE
        if (name === null) {
            const matches = component._instance.constructor.toString().match(/^function\s*([^\s(]+)/);

            if (matches)
                name = matches[1];
        }

        return name;
    }

    function getRootComponent (el) {
        if (!el || el.nodeType !== 1)
            return null;

        for (var prop of Object.keys(el)) {
            if (!/^__reactInternalInstance/.test(prop))
                continue;

            return el[prop]._currentElement._owner;
        }
    }

    function defineSelectorProperty (value) {
        if (window['%testCafeReactSelector%'])
            delete window['%testCafeReactSelector%'];

        Object.defineProperty(window, '%testCafeReactSelector%', {
            enumerable:   false,
            configurable: true,
            writable:     false,
            value:        value
        });
    }

    if (!window['%testCafeReactSelectorUtils%']) {
        window['%testCafeReactSelectorUtils%'] = {
            getName: getName
        };
    }

    function reactSelect (compositeSelector) {
        const foundComponents = [];

        function findDOMNode (rootEl) {
            if (typeof compositeSelector !== 'string')
                throw new Error(`Selector option is expected to be a string, but it was ${typeof compositeSelector}.`);

            var selectorIndex = 0;
            var selectorElms  = compositeSelector
                .split(' ')
                .filter(el => !!el)
                .map(el => el.trim());

            if (selectorElms.length)
                defineSelectorProperty(selectorElms[selectorElms.length - 1]);

            function walk (reactComponent, cb) {
                //NOTE: stateless component
                if (!reactComponent)
                    return;

                const componentWasFound = cb(reactComponent);

                //NOTE: we're looking for only between the children of component
                if (selectorIndex > 0 && selectorIndex < selectorElms.length && !componentWasFound) {
                    const isTag  = selectorElms[selectorIndex].toLowerCase() === selectorElms[selectorIndex];
                    const parent = reactComponent._hostParent;

                    if (isTag && parent) {
                        var renderedChildren       = parent._renderedChildren;
                        const renderedChildrenKeys = Object.keys(renderedChildren);

                        const currentElementId = renderedChildrenKeys.filter(key => {
                            var renderedComponent = renderedChildren[key]._renderedComponent;

                            return renderedComponent && renderedComponent._domID === reactComponent._domID;
                        })[0];

                        if (!renderedChildren[currentElementId])
                            return;
                    }
                }

                const currSelectorIndex = selectorIndex;

                renderedChildren = reactComponent._renderedChildren ||
                                   reactComponent._renderedComponent &&
                                   { _: reactComponent._renderedComponent } ||
                                   {};

                Object.keys(renderedChildren).forEach(key => {
                    walk(renderedChildren[key], cb);

                    selectorIndex = currSelectorIndex;
                });
            }


            return walk(getRootComponent(rootEl), reactComponent => {
                const componentName = getName(reactComponent);

                if (!componentName)
                    return false;

                const domNode = reactComponent.getHostNode();

                if (selectorElms[selectorIndex] !== componentName)
                    return false;

                if (selectorIndex === selectorElms.length - 1)
                    foundComponents.push(domNode);

                selectorIndex++;

                return true;
            });
        }

        [].forEach.call(rootEls, findDOMNode);

        return foundComponents;
    }

    return reactSelect(selector);
}).addCustomMethods({
    getReact: (node, fn) => {
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
            const parent               = component._hostParent;
            const renderedChildren     = parent._renderedChildren || {};
            const renderedChildrenKeys = Object.keys(renderedChildren);
            const componentName        = window['%testCafeReactSelector%'];

            for (let index = 0; index < renderedChildrenKeys.length; ++index) {
                const key             = renderedChildrenKeys[index];
                let renderedComponent = renderedChildren[key];
                let componentInstance = null;

                while (renderedComponent) {
                    if (componentName === utils.getName(renderedComponent))
                        componentInstance = renderedComponent._instance;

                    if (renderedComponent._domID === component._domID)
                        return componentInstance;

                    renderedComponent = renderedComponent._renderedComponent;
                }
            }

            return null;
        }

        function getComponentForDOMNode (el) {
            if (!el || !(el.nodeType === 1 || el.nodeType === 8))
                return null;

            const isRootNode = el.hasAttribute && el.hasAttribute('data-reactroot');

            for (var prop of Object.keys(el)) {
                if (!/^__reactInternalInstance/.test(prop))
                    continue;

                if (isRootNode) {
                    const rootComponent = el[prop]._currentElement._owner;

                    //NOTE: stateless
                    if (!rootComponent)
                        return null;

                    return rootComponent._instance;
                }

                return getComponentInstance(el[prop]);
            }
        }

        var componentInstance = getComponentForDOMNode(node);

        if (!componentInstance)
            return null;

        delete window['%testCafeReactSelector%'];

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
});
