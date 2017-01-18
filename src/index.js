/*global document window*/
var Selector = require('testcafe').Selector;

export default Selector(selector => {
    const SUPPORTED_REACT_VERSION = 15;

    if (!window.React)
        return document.querySelectorAll(selector);

    const reactVersion = parseInt(window.React.version.split('.')[0], 10);

    if (reactVersion < SUPPORTED_REACT_VERSION)
        throw new Error('testcafe-react-selectors supports React js starting with 15.x version');

    function reactSelect (compositeSelector) {
        const foundComponents = [];
        let foundInstance     = null;

        function getComponentInstance (el) {
            if (el.nodeType !== 1)
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
                reactComponentName = foundInstance.constructor.name ||
                                     foundInstance.constructor.toString().match(/^function\s*([^\s(]+)/)[1];
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
}).addCustomDOMProperties({
    react: node => {
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

        return {
            state: copyReactObject(componentInstance.state),
            props: copyReactObject(componentInstance.props)
        };
    }
});

