/*global document*/

/*eslint-disable no-unused-vars*/
function getRootElsReact15 () {
    /*eslint-enable no-unused-vars*/

    const rootEls      = document.querySelectorAll('[data-reactroot]');
    const checkRootEls = rootEls.length &&
                         Object.keys(rootEls[0]).some(prop => {
                             const rootEl = rootEls[0];

                             //NOTE: server rendering in React 16 also adds data-reactroot attribute
                             return /^__reactInternalInstance/.test(prop) && !!rootEl[prop]._hostContainerInfo;
                         });

    return checkRootEls && rootEls || [];
}