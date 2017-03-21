/*global document*/
var Selector = require('testcafe').Selector;

export default Selector(selector => {
    var rootEl                = document.querySelector('[data-reactroot]');
    var supportedReactVersion = rootEl && Object.keys(rootEl).some(prop => /^__reactInternalInstance/.test(prop));

    if (!supportedReactVersion)
        throw new Error('testcafe-react-selectors supports React version 15.x and newer');

    function reactSelect (compositeSelector) {
        const foundComponents = [];
        let foundInstance     = null;

        function getComponentInstance (el) {
            if (!el || el.nodeType !== 1)
                return null;

            for (var prop of Object.keys(el)) {
                if (!/^__reactInternalInstance/.test(prop))
                    continue;

                //NOTE: stateless component
                if (!el[prop]._currentElement._owner)
                    return null;

                return el[prop]._currentElement._owner._instance;
            }
        }

        function getComponentName (DOMNode) {
            let reactComponentName     = null;
            const reactComponentParent = foundInstance._reactInternalInstance._renderedComponent._hostNode;

            if (reactComponentParent === DOMNode) {
                //NOTE: IE hack
                if (foundInstance.constructor.name)
                    reactComponentName = foundInstance.constructor.name;
                else {
                    const matches = foundInstance.constructor.toString().match(/^function\s*([^\s(]+)/);

                    reactComponentName = matches ? matches[1] : DOMNode.tagName.toLowerCase();
                }
            }
            else {
                reactComponentName = DOMNode.tagName.toLowerCase();
                foundInstance      = null;
            }

            return reactComponentName;
        }

        function findDOMNode () {
            if (typeof compositeSelector !== 'string')
                throw new Error(`Selector option is expected to be a string, but it was ${typeof compositeSelector}.`);

            var selectorIndex = 0;
            var selectorElms  = compositeSelector
                .split(' ')
                .filter(el => !!el)
                .map(el => el.trim());

            function walk (node, cb) {
                var searchResult      = cb(node);
                var currSelectorIndex = selectorIndex;

                if (searchResult)
                    return searchResult;

                node = node.firstChild;

                while (node) {
                    searchResult = walk(node, cb);

                    if (searchResult)
                        return searchResult;

                    node          = node.nextSibling;
                    selectorIndex = currSelectorIndex;
                }
            }

            return walk(document.body, node => {
                if (!(foundInstance = getComponentInstance(node)))
                    return null;

                const componentName = getComponentName(node);

                if (selectorElms[selectorIndex] !== componentName)
                    return null;

                if (selectorIndex === selectorElms.length - 1)
                    foundComponents.push(node);

                selectorIndex++;

                return null;
            });
        }

        findDOMNode();

        return foundComponents;
    }

    return reactSelect(selector);
}).addCustomMethods({
    getReact: (node, fn) => {
        function copyReactObject (obj) {
            var copiedObj = {};

            for (var prop in obj) {
                if (obj.hasOwnProperty(prop) && prop !== 'children')
                    copiedObj[prop] = obj[prop];
            }

            return copiedObj;
        }

        function getComponentForDOMNode (el) {
            if (!el || el.nodeType !== 1)
                return null;

            for (var prop of Object.keys(el)) {
                if (!/^__reactInternalInstance/.test(prop))
                    continue;

                //NOTE: stateless component
                if (!el[prop]._currentElement._owner)
                    return null;

                var foundInstance = el[prop]._currentElement._owner._instance;

                if (foundInstance._reactInternalInstance._renderedComponent._hostNode !== el)
                    return null;

                return foundInstance;
            }
        }

        var componentInstance = getComponentForDOMNode(node);

        if (!componentInstance)
            return null;

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
