/*global React ReactDOM*/
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


ReactDOM.render(<App text="AppTitle"/>, document.getElementById('app-container'));