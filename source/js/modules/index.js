var React = require('react');
var {render} = require('react-dom');
var {Router, Route, Link, IndexRoute} = require('react-router');

// components
var Coord = require('./CoordFunc');
var Light = require('./LightFunc');

var App = React.createClass({
    render: function() {
        return (
            <div>
                <ul className="menu">
                    <li><Link to="/coord">Coordinate System</Link></li>
                    <li><Link to="/light">Light&Color</Link></li>
                </ul>
                {this.props.children}
            </div>
        );
    }
});

render((
    <Router>
        <Route path="/" component={App}>
            <IndexRoute component={Light} />
            <Route path="coord" component={Coord} />
            <Route path="light" component={Light} />
        </Route>
    </Router>
), document.getElementById('container'));

