/*global React ReactDOM*/
class ListItem extends React.Component {
    constructor (props) {
        super();

        this.state = {
            itemId: props.id
        }
    }

    render () {
        return <li id={this.props.id}><p>{this.props.id} text</p></li>;
    }
}

class List extends React.Component {
    constructor () {
        super();
    }

    render () {
        return (
            <div>
                <ul id="list">
                    <ListItem id={this.props.id + '-item1'}/>
                    <ListItem id={this.props.id + '-item2'}/>
                    <ListItem id={this.props.id + '-item3'}/>
                </ul>
            </div>
        );
    }
}

class App extends React.Component {
    constructor () {
        super();
    }

    render () {
        return (
            <div id="app">
                <div id="stateless"/>
                <div>
                    <div>
                        <List id="l1"/>
                    </div>
                </div>
                <div>
                    <div>
                        <List id="l2"/>
                    </div>
                </div>
            </div>
        );
    }
}

window.addEventListener('load', function () {
    function Stateless (props) {
        return <div>{props.text}</div>;
    }

    ReactDOM.render(React.createElement(App), document.getElementById('app-container'));
    ReactDOM.render(<Stateless text="stateless"/>, document.getElementById('stateless'));
});