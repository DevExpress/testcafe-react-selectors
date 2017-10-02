/*global window document Node rootEls defineSelectorProperty*/
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

    if (!window['%testCafeReactSelectorUtils%'])
        window['%testCafeReactSelectorUtils%'] = { getName };

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
        const compositeSelectorTrimmed = compositeSelector.trim();
        const elements = [];
        let numSquareBrackets = 0;
        let elementName = '';

        for (let i = 0; i < compositeSelectorTrimmed.length; i++) {
            const c = compositeSelectorTrimmed[i];

            if (c === '[')
                numSquareBrackets++;

            if (c === ']')
                numSquareBrackets--;

            // If there's a space, we've reached the end of an element name which means
            //  we should push the element name to the list of elements
            if (c === ' ') {
                if (numSquareBrackets === 0) {
                    elements.push(elementName);
                    elementName = '';
                    numSquareBrackets = 0;
                    continue;
                }
            }

            elementName += c;
        }

        // Push the last element since there's no space to trigger the push above
        elements.push(elementName);

        return elements
            .filter(el => !!el)
            .map(el => {
                const attributePairs = el.match(/\[.+?\]/g, () => {}) || [];
                const name = el.replace(/\[.+?\]/g, '').trim();
                const attributes = attributePairs.map((attribute) => {
                    const attributeKeyValuePair = attribute.substr(1, attribute.length - 2);
                    const attributeName = attributeKeyValuePair.substr(0, attributeKeyValuePair.indexOf('='));
                    let attributeValue = attributeKeyValuePair.substr(attributeKeyValuePair.indexOf('=') + 1);

                    // Strip out quotation marks
                    if (
                        (attributeValue[0] === '"' || attributeValue[0] === '\'') &&
                        (attributeValue[attributeValue.length - 1] === '"' || attributeValue[attributeValue.length - 1] === '\'')
                    )
                        attributeValue = attributeValue.substr(1, attributeValue.length - 2);


                    return {
                        name:  attributeName,
                        value: attributeValue
                    };
                });

                return {
                    name,
                    attributes
                };
            });
    }

    function reactSelect (compositeSelector) {
        const foundComponents = [];

        function findDOMNode (rootComponent) {
            if (typeof compositeSelector !== 'string')
                throw new Error(`Selector option is expected to be a string, but it was ${typeof compositeSelector}.`);

            var selectorIndex = 0;
            var selectorElms  = parseSelectorElements(compositeSelector);

            if (selectorElms.length)
                defineSelectorProperty(selectorElms[selectorElms.length - 1].name);

            function walk (reactComponent, cb) {
                if (!reactComponent) return;

                const componentWasFound = cb(reactComponent);
                const currSelectorIndex = selectorIndex;

                const isNotFirstSelectorPart = selectorIndex > 0 && selectorIndex < selectorElms.length;

                if (isNotFirstSelectorPart && !componentWasFound) {
                    const isTag = selectorElms[selectorIndex].name.toLowerCase() === selectorElms[selectorIndex].name;

                    //NOTE: we're looking for only between the children of component
                    if (isTag && getName(reactComponent.return) !== selectorElms[selectorIndex - 1].name)
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

                if (selectorElms[selectorIndex] && selectorElms[selectorIndex].name !== componentName) return false;
                if (selectorElms[selectorIndex] && selectorElms[selectorIndex].attributes.length > 0) {
                    const props = reactComponent.memoizedProps || {};
                    const unequalAttributes = selectorElms[selectorIndex].attributes.filter((attribute) => {
                        return props[attribute.name] !== attribute.value;
                    });

                    if (unequalAttributes.length > 0)
                        return false;
                }

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