/*global document*/

/*eslint-disable no-unused-vars*/
function getRootElsReact16to18 (el) {
    el = el || document.body;

    let rootEls = [];

    if (el._reactRootContainer) {
        const rootContainer = el._reactRootContainer._internalRoot || el._reactRootContainer;

        rootEls.push(rootContainer.current.child);
    }

    else {
        //NOTE: approach for React 18 createRoot API
        for (var prop of Object.keys(el)) {
            if (!/^__reactContainer/.test(prop)) continue;

            //NOTE: component and its alternate version has the same stateNode, but stateNode has the link to rendered version in the 'current' field
            const component = el[prop].stateNode.current;

            rootEls.push(component);

            break;
        }
    }

    const children = el.children;

    for (let index = 0; index < children.length; ++index) {
        const child = children[index];

        rootEls = rootEls.concat(getRootElsReact16to18(child));

    }

    return rootEls;
}
