/*global React ReactDOM*/
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

ReactDOM.render(<App />, document.getElementById('app-container'));

