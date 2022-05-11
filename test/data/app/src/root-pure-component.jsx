import React from 'react';
import ReactDOM from 'react-dom/client';

class PureComponent extends React.PureComponent {
    constructor () {
        super();
    }

    render () {
        return (
            <div>
                {this.props.children}
            </div>
        )
    }
}

class App extends React.PureComponent {
    constructor () {
        super();

        this.state = {
            text: 'PureComponent'
        }
    }

    render () {
        return <PureComponent>{this.state.text}</PureComponent>;
    }
}

ReactDOM.createRoot(document.getElementById('app-container')).render(
    <App text="AppTitle"/>
);