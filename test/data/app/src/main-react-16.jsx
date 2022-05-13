import React from 'react16';
import ReactDOM from 'react-dom16';
import AppFactory from './app-old-versions';

const { App, NestedApp } = AppFactory(React, ReactDOM);

ReactDOM.render(React.createElement(App, { label: 'AppLabel' }), document.getElementById('app-container'));
ReactDOM.render(React.createElement(NestedApp, { label: 'NestedAppLabel' }), document.getElementById('nestedapp-container'));