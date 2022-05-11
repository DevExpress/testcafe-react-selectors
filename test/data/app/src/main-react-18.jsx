import React from 'react';
import ReactDOM from 'react-dom/client';
import { App, NestedApp } from './app';

ReactDOM.createRoot(document.getElementById('app-container')).render(
  <React.StrictMode>
    <App label="AppLabel"/>
  </React.StrictMode>
);

//NOTE: react 18 does not have a render callback
setTimeout(() => {
  ReactDOM.createRoot(document.getElementById('nestedapp-container')).render(
    <NestedApp label="NestedAppLabel" />
  );
}, 0);
