import React from 'react';
import ReactDOM from 'react-dom/client';

class PureComponent extends React.PureComponent {
    constructor () {
        super();

        this.state = {
            text: 'PureComponent'
        }
    }

    render () {
        return <span>{this.state.text}</span>;
    }
}

const App = () => {
    return (
        <div id="app">
            <PureComponent />
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('app-container')).render(
    <App text="AppTitle"/>
);