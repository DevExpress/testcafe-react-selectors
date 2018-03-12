/*global document*/

/*eslint-disable no-unused-vars*/
function getRootElsReact15 () {
    /*eslint-enable no-unused-vars*/

    function getRootComponent (el) {
        if (!el || el.nodeType !== 1) return null;

        for (var prop of Object.keys(el)) {
            if (!/^__reactInternalInstance/.test(prop)) continue;

            return el[prop]._hostContainerInfo._topLevelWrapper._renderedComponent;
        }
    }

    const rootEls      = [].slice.call(document.querySelectorAll('[data-reactroot]'));
    const checkRootEls = rootEls.length &&
                         Object.keys(rootEls[0]).some(prop => {
                             const rootEl = rootEls[0];

                             //NOTE: server rendering in React 16 also adds data-reactroot attribute, we check existing the
                             //alternate field because it doesn't exists in React 15.
                             return /^__reactInternalInstance/.test(prop) && !rootEl[prop].hasOwnProperty('alternate');
                         });

    return (checkRootEls && rootEls || []).map(getRootComponent);
}
