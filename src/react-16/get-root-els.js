/*global document*/

/*eslint-disable no-unused-vars*/
function getRootElsReact16 (el) {
    el = el || document.body;
    
    let rootEls = [];

    if (el._reactRootContainer) {
        const rootContainer = el._reactRootContainer._internalRoot || el._reactRootContainer;

        rootEls.push(rootContainer.current.child);
    }

    const children = el.children;

    for (let index = 0; index < children.length; ++index) {
        const child = children[index];

        rootEls = rootEls.concat(getRootElsReact16(child));
    }

    return rootEls;
}
