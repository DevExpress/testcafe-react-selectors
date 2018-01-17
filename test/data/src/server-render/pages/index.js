var React = require('react');

class Label extends React.Component {
    constructor () {
        super();

        this.state = {
            text: 'Label Text...'
        }
    }

    render () {
        return <span>{this.state.text}</span>;
    }
}

const App = () => <div><Label/></div>;

export default App;
