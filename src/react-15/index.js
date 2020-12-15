/*global window rootEls defineSelectorProperty visitedRootEls checkRootNodeVisited*/

/*eslint-disable no-unused-vars*/
function react15elector (selector, _, parents = rootEls) {
    const ELEMENT_NODE = 1;
    const COMMENT_NODE = 8;

    window['%testCafeReactFoundComponents%'] = [];

    const { getName, getRootComponent }  = window['%testCafeReactSelectorUtils%']['15'];

    function getRenderedChildren (component) {
        const hostNode        = component.getHostNode();
        const hostNodeType    = hostNode.nodeType;
        const container       = component._instance && component._instance.container;
        const isRootComponent = hostNode.hasAttribute && hostNode.hasAttribute('data-reactroot');

        //NOTE: prevent the repeating visiting of reactRoot Component inside of portal
        if (component._renderedComponent && isRootComponent) {
            if (checkRootNodeVisited(component._renderedComponent))
                return [];

            visitedRootEls.push(component._renderedComponent);
        }

        //NOTE: Detect if it's a portal component
        if (hostNodeType === COMMENT_NODE && container) {
            const domNode = container.querySelector('[data-reactroot]');

            return { _: getRootComponent(domNode) };
        }

        return component._renderedChildren ||
               component._renderedComponent &&
               { _: component._renderedComponent } ||
               {};
    }

    function parseSelectorElements (compositeSelector) {
        return compositeSelector
            .split(' ')
            .filter(el => !!el)
            .map(el => el.trim());
    }

    function reactSelect (compositeSelector) {
        const foundComponents = [];

        function findDOMNode (rootEl) {
            if (typeof compositeSelector !== 'string')
                throw new Error(`Selector option is expected to be a string, but it was ${typeof compositeSelector}.`);

            var selectorIndex = 0;
            var selectorElms  = parseSelectorElements(compositeSelector);

            if (selectorElms.length)
                defineSelectorProperty(selectorElms[selectorElms.length - 1]);

            function walk (reactComponent, cb) {
                if (!reactComponent) return;

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

                renderedChildren = getRenderedChildren(reactComponent);


                Object.keys(renderedChildren).forEach(key => {
                    walk(renderedChildren[key], cb);

                    selectorIndex = currSelectorIndex;
                });
            }

            return walk(rootEl, reactComponent => {
                const componentName = getName(reactComponent);

                if (!componentName) return false;

                const domNode = reactComponent.getHostNode();

                if (selectorElms[selectorIndex] !== componentName) return false;

                if (selectorIndex === selectorElms.length - 1) {
                    if (foundComponents.indexOf(domNode) === -1)
                        foundComponents.push(domNode);

                    window['%testCafeReactFoundComponents%'].push({ node: domNode, component: reactComponent });
                }

                selectorIndex++;

                return true;
            });
        }

        [].forEach.call(parents, findDOMNode);

        return foundComponents;
    }

    return reactSelect(selector);
}
