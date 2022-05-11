import React from 'react17';
import ReactDOM from 'react-dom17';
import AppFactory from './app-old-versions';

const { App, NestedApp } = AppFactory(React, ReactDOM);

ReactDOM.render(React.createElement(App, { label: 'AppLabel' }), document.getElementById('app-container'));
ReactDOM.render(React.createElement(NestedApp, { label: 'NestedAppLabel' }), document.getElementById('nestedapp-container'));