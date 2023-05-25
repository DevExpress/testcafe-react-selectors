/*global window document Node rootEls defineSelectorProperty visitedRootEls checkRootNodeVisited*/

/*eslint-disable no-unused-vars*/
function react16to18Selector (selector, renderedRootIsUnknown, parents = rootEls) {
    window['%testCafeReactFoundComponents%'] = [];

    const { getRenderedComponentVersion }  = window['%testCafeReactSelectorUtils%']['16|17|18'];

    /*eslint-enable no-unused-vars*/
    function createAnnotationForEmptyComponent (component) {
        const comment = document.createComment('testcafe-react-selectors: the requested component didn\'t render any DOM elements');

        comment.__$$reactInstance = component;

        if (!window['%testCafeReactEmptyComponent%']) window['%testCafeReactEmptyComponent%'] = [];

        window['%testCafeReactEmptyComponent%'].push(comment);

        return comment;
    }

    function getName (component) {
        //react memo
        // it will find the displayName on the elementType if you set it
        if (component.elementType && component.elementType.displayName) return component.elementType.displayName;


        if (!component.type && !component.memoizedState)
            return null;

        const currentElement = component.type ? component : component.memoizedState.element;

        //NOTE: tag
        if (component.type) {
            if (typeof component.type === 'string') return component.type;
            if (component.type.displayName || component.type.name) return component.type.displayName || component.type.name;
        }

        const matches = currentElement?.type.toString().match(/^function\s*([^\s(]+)/);

        if (matches) return matches[1];

        return null;
    }

    function findNodeWithStateNodeInChildrenOrSiblings (searchNode) {
        const nodesToCheck = [];

        nodesToCheck.push(searchNode);
        while (nodesToCheck.length > 0) {
            const node = nodesToCheck.shift();

            if (node.stateNode instanceof Node) return node;
            if (node.child) nodesToCheck.push(node.child);
            if (node.sibling && node !== searchNode) nodesToCheck.push(node.sibling);
        }
        return searchNode;
    }

    function getContainer (component) {
        let node = renderedRootIsUnknown ? getRenderedComponentVersion(component) : component;

        node = findNodeWithStateNodeInChildrenOrSiblings(node);

        if (!(node.stateNode instanceof Node))
            return null;

        return node.stateNode;
    }

    function getRenderedChildren (component) {
        const isRootComponent = rootEls.indexOf(component) > -1;

        //Nested root element
        if (isRootComponent) {
            if (checkRootNodeVisited(component)) return [];

            visitedRootEls.push(component);
        }

        //Portal component
        if (!component.child) {
            const portalRoot = component.stateNode && component.stateNode.container &&
                               component.stateNode.container._reactRootContainer;

            const rootContainer = portalRoot && (portalRoot._internalRoot || portalRoot);

            if (rootContainer) component = rootContainer.current;
        }

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

                if (selectorIndex === selectorElms.length - 1) {
                    if (foundComponents.indexOf(domNode) === -1)
                        foundComponents.push(domNode || createAnnotationForEmptyComponent(reactComponent));

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
