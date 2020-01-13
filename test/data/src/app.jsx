/*global React ReactDOM*/
class ListItem extends React.Component {
    constructor (props) {
        super();

        this.state = {
            itemId: props.id
        }
    }

    render () {
        return <li id={this.props.id}><p key={`${this.props.id}-p`}>{this.props.id} text</p></li>;
    }
}

class List extends React.Component {
    constructor () {
        super();

        this.state = { isActive: false };

        this._onClick = this._onClick.bind(this);
    }

    _onClick () {
        this.setState({ isActive: true });
    }

    render () {
        return (
            <div>
                List: {this.props.id}
                <ul id="list" onClick={this._onClick}>
                    <ListItem id={this.props.id + '-item1'} selected={this.state.isActive} key="ListItem1"/>
                    <ListItem id={this.props.id + '-item2'} key="ListItem2"/>
                    <ListItem id={this.props.id + '-item3'}/>
                </ul>
            </div>
        );
    }
}

class TextLabel extends React.Component {
    constructor () {
        super();

        this.state = {
            text: 'Component inside of wrapper component'
        }
    }

    render () {
        return <div>{this.state.text}</div>;
    }
}

class WrapperComponent extends React.Component {
    constructor () {
        super();

        this.state = { width: 100 };
    }

    render () {
        return <TextLabel color="#fff"/>;
    }
}

class EmptyComponent extends React.Component {
    constructor () {
        super();

        this.state = {
            id:   1,
            text: null
        };
    }

    render () {
        return this.state.text;
    }
}

class Portal extends React.Component {
    constructor () {
        super();

        this.container = document.createElement('div');
        this.state     = { width: 100 };

        document.body.appendChild(this.container);
    }

    _renderPortal () {
        ReactDOM.unstable_renderSubtreeIntoContainer(
            this,
            <List id="l3"/>,
            this.container
        );
    }

    componentDidMount () {
        this._renderPortal();
    }

    render () {
        return null;
    }
}

class PortalReact16 extends React.Component {
    constructor () {
        super();

        this.container = document.createElement('div');
        this.state     = { width: 100 };
    }

    componentDidMount () {
        document.body.appendChild(this.container);
    }

    render () {
        if (!ReactDOM.createPortal) return null;

        return ReactDOM.createPortal(
            <List id="l3"/>,
            this.container
        );
    }
}

class PureComponent extends React.PureComponent {
    constructor () {
        super();
    }

    render () {
        return <span>PureComponent</span>;
    }
}

class PortalWithPureComponent extends React.Component {
    constructor () {
        super();

        this.container = document.createElement('div');

        document.body.appendChild(this.container);
    }

    _renderPortal () {
        ReactDOM.unstable_renderSubtreeIntoContainer(
            this,
            <PureComponent/>,
            this.container
        );
    }

    componentDidMount () {
        this._renderPortal();
    }

    render () {
        return null;
    }
}

const Stateless1 = function Stateless1 (props) {
    return <div>{props.text}</div>;
};

const Stateless2 = function Stateless2 () {
    return <div>test</div>;
};

const Stateless3 = function (props) {
    return <div>{props.text}</div>;
};

const Stateless4 = function Stateless4 () {
    return null;
};

class SmartComponent extends React.Component {
    constructor () {
        super();

        this.state = {
            text: 'Disabled'
        };

        this._onClick = this._onClick.bind(this);
    }

    _onClick () {
        const newText = this.state.text === 'Enabled' ? 'Disabled' : 'Enabled';

        this.setState({ text: newText });
    }

    render () {
        return <div onClick={this._onClick}><Stateless1 text={this.state.text}/></div>;
    }
}

const SetItemLabel = ({ text }) => <span> {text} </span>;
const SetItem      = ({ text }) => text ? <SetItemLabel text={text}/> : null;

class UnfilteredSet extends React.Component {
    render () {
        return (<div>
            <SetItem prop1={true} text="SetItem1"/>
            <SetItem prop1={true} prop2={{ enabled: false }}/>
            <SetItem prop1={true} prop2={{ enabled: true }} text="SetItem2"/>
            <SetItem prop1={'test'} prop2={0}/>
            <SetItem text="SetItem3"/>
        </div>);
    }
}

class UnfilteredSet_PartialMatching extends React.Component {
    render () {
        const prop1_1 = {
            obj: {
                field1: 1,
                field2: 2,
                field3: {
                    subField1: 1,
                    subField2: 2
                }
            }
        };

        const prop1_2 = {
            obj: {
                field1: 1,
                field2: 0,
                field3: {
                    subField1: 1,
                    subField2: 0
                }
            }
        };

        return (<div>
            <SetItem prop1={prop1_1}/>
            <SetItem prop1={prop1_1}/>
            <SetItem prop1={prop1_2}/>
        </div>);
    }
}

const NestedApp = function NestedApp () {
    return <Stateless1 text="Inside nested app"/>;
};

const ToMemoize = ({ text }) => <div>{text}</div>;
const Memoized = React.memo ? React.memo(ToMemoize) : ToMemoize;

Memoized.displayName = 'Memoized';

class App extends React.Component {
    constructor () {
        super();

        this.state = {
            isRootComponent: true
        };
    }

    render () {
        return (
            <div id="app">
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
                <WrapperComponent direction="horizontal"/>
                <EmptyComponent/>
                <PureComponent/>

                <Portal key="portal"/>
                <PortalWithPureComponent/>

                <Stateless1 text="test"/>
                <Stateless2/>
                <Stateless3 text="test"/>
                <Stateless4/>

                <PortalReact16 key="portalReact16"/>

                <SmartComponent/>
                <UnfilteredSet/>
                <UnfilteredSet_PartialMatching/>
                <Memoized text="Memo" />
                <div id="nestedapp-container"></div>
            </div>
        );
    }
}

ReactDOM.render(React.createElement(App, { label: 'AppLabel' }), document.getElementById('app-container'));
ReactDOM.render(React.createElement(NestedApp, { label: 'NestedAppLabel' }), document.getElementById('nestedapp-container'));

