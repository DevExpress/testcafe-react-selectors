/*global document*/
/*eslint-disable no-unused-vars*/
function getRootElsReact15 () {
/*eslint-enable no-unused-vars*/
    const rootEls      = document.querySelectorAll('[data-reactroot]');
    const checkRootEls = rootEls.length && Object.keys(rootEls[0]).some(prop => /^__reactInternalInstance/.test(prop));

    return checkRootEls && rootEls || [];
}