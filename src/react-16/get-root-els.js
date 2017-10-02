/*global document NodeFilter*/
/*eslint-disable no-unused-vars*/
function getRootElsReact16 () {
/*eslint-enable no-unused-vars*/
    let instance     = null;
    const treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, () => NodeFilter.FILTER_ACCEPT, false);
    let currentNode  = treeWalker.nextNode();

    while (currentNode) {
        instance = currentNode._reactRootContainer;

        if (instance) return [instance.current.child];

        currentNode = treeWalker.nextNode();
    }

    return [];
}