function loadScriptSync (src) {
    var head   = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');

    script.type  = "text/javascript";
    script.async = false;
    script.src   = src;

    head.appendChild(script);
}

window.loadApp = function (version) {
    loadScriptSync('./vendor/react-' + version + '/react.js');
    loadScriptSync('./vendor/react-' + version + '/react-dom.js');
    loadScriptSync(window.appSrc);
};