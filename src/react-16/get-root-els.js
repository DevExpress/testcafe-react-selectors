/*global document*/

/*eslint-disable no-unused-vars*/
function getRootElsReact16 (el) {
    el = el || document.body;

    if (el._reactRootContainer) return el._reactRootContainer.current.child;

    const children = el.children;
    let rootEls    = [];

    for (let index = 0; index < children.length; ++index) {
        const child = children[index];

        rootEls = rootEls.concat(getRootElsReact16(child));
    }

    return rootEls;
}