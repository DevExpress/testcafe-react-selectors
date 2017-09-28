/*global window document Node rootEls*/
/*eslint-disable no-unused-vars*/
function react16Selector (selector) {
/*eslint-enable no-unused-vars*/
    function createAnnotationForEmptyComponent (component) {
        const comment = document.createComment('testcafe-react-selectors: the requested component didn\'t render any DOM elements');

        comment.__$$reactInstance = component;

        window['%testCafeReactEmptyComponent%'] = comment;

        return comment;
    }

    function getName (component) {
        if (!component.type && !component.memoizedState)
            return null;

        const currentElement = component.type ? component : component.memoizedState.element;

        //NOTE: tag
        if (typeof component.type === 'string') return component.type;
        if (component.type.name) return component.type.name;

        const matches = currentElement.type.toString().match(/^function\s*([^\s(]+)/);

        if (matches) return matches[1];

        return null;
    }

    function getContainer (component) {
        let node = component;

        while (!(node.stateNode instanceof Node)) {
            if (node.child) node = node.child;
            else break;
        }

        if (!(node.stateNode instanceof Node))
            return null;

        return node.stateNode;
    }

    function getRootComponent (el) {
        if (!el || el.nodeType !== 1)
            return null;

        for (var prop of Object.keys(el)) {
            if (!/^__reactInternalInstance/.test(prop)) continue;

            return el[prop]._hostContainerInfo._topLevelWrapper._renderedComponent;
        }
    }

    function defineSelectorProperty (value) {
        if (window['%testCafeReactSelector%']) delete window['%testCafeReactSelector%'];
        if (window['%testCafeReactEmptyComponent%']) delete window['%testCafeReactEmptyComponent%'];

        Object.defineProperty(window, '%testCafeReactSelector%', {
            enumerable:   false,
            configurable: true,
            writable:     false,
            value:        value
        });
    }

    if (!window['%testCafeReactSelectorUtils%'])
        window['%testCafeReactSelectorUtils%'] = { getName, getRootComponent };

    function getRenderedChildren (component) {
        //Portal component
        if (!component.child && component.stateNode.container && component.stateNode.container._reactRootContainer)
            component = component.stateNode.container._reactRootContainer.current;

        if (!component.child) return [];

        let currentChild = component.child;

        if (typeof component.type !== 'string')
            currentChild = component.child;

        const children = [currentChild];

        while (currentChild.sibling) {
            children.push(currentChild.sibling);

            currentChild = currentChild.sibling;
        }

        return children;
    }

    function parseSelectorElements (compositeSelector) {
        return compositeSelector
            .split(' ')
            .filter(el => !!el)
            .map(el => el.trim());
    }

    function reactSelect (compositeSelector) {
        const foundComponents = [];

        function findDOMNode (rootComponent) {
            if (typeof compositeSelector !== 'string')
                throw new Error(`Selector option is expected to be a string, but it was ${typeof compositeSelector}.`);

            var selectorIndex = 0;
            var selectorElms  = parseSelectorElements(compositeSelector);

            if (selectorElms.length)
                defineSelectorProperty(selectorElms[selectorElms.length - 1]);

            function walk (reactComponent, cb) {
                if (!reactComponent) return;

                const componentWasFound = cb(reactComponent);
                const currSelectorIndex = selectorIndex;

                const isNotFirstSelectorPart = selectorIndex > 0 && selectorIndex < selectorElms.length;

                if (isNotFirstSelectorPart && !componentWasFound) {
                    const isTag = selectorElms[selectorIndex].toLowerCase() === selectorElms[selectorIndex];

                    //NOTE: we're looking for only between the children of component
                    if (isTag && getName(reactComponent.return) !== selectorElms[selectorIndex - 1])
                        return;
                }

                const renderedChildren = getRenderedChildren(reactComponent);

                Object.keys(renderedChildren).forEach(key => {
                    walk(renderedChildren[key], cb);

                    selectorIndex = currSelectorIndex;
                });
            }

            return walk(rootComponent, reactComponent => {
                const componentName = getName(reactComponent);

                if (!componentName) return false;

                const domNode = getContainer(reactComponent);

                if (selectorElms[selectorIndex] !== componentName) return false;

                if (selectorIndex === selectorElms.length - 1)
                    foundComponents.push(domNode || createAnnotationForEmptyComponent(reactComponent));

                selectorIndex++;

                return true;
            });
        }

        [].forEach.call(rootEls, findDOMNode);

        return foundComponents;
    }

    return reactSelect(selector);
}