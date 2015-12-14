var React = require('react');
var ReactDOM = require('react-dom');
// webgl element
var webGL = require('../common/webgl');
var {mat4, vec3} = require('gl-matrix');

var LightFunc = React.createClass({
    render: function() {
        return (
            <div></div>
        );
    }
});

var CoordFunc = React.createClass({
    render: function() {
        var view = this.props.config.view;
        var ortho = this.props.config.ortho;
        var pers = this.props.config.perspec;
        var viewCb = this.props.viewChangeCb;
        var projCb = this.props.projChangeCb;
        var rdStyle = {
            verticalAlign: 'middle',
            marginTop: '4px'
        };
        return (
            <div className="func">
                <h3>View</h3>
                <div>
                    <label className="formLabel small">eyeX</label>
                    <input type="number" className="form tiny" defaultValue={view.eyeX} step="1" onChange={(e)=>viewCb('eyeX', e.target.value)} />
                    <label className="formLabel small">eyeY</label>
                    <input type="number" className="form tiny" defaultValue={view.eyeY} step="1" onChange={(e)=>viewCb('eyeY', e.target.value)} />
                    <label className="formLabel small">eyeZ</label>
                    <input type="number" className="form tiny" defaultValue={view.eyeZ} step="1" onChange={(e)=>viewCb('eyeZ', e.target.value)} />
                    <label className="formLabel small">centerX</label>
                    <input type="number" className="form tiny" defaultValue={view.centerX} step="1" onChange={(e)=>viewCb('centerX', e.target.value)} />
                    <label className="formLabel small">centerY</label>
                    <input type="number" className="form tiny" defaultValue={view.centerY} step="1" onChange={(e)=>viewCb('centerY', e.target.value)} />
                    <label className="formLabel small">centerZ</label>
                    <input type="number" className="form tiny" defaultValue={view.centerZ} step="1" onChange={(e)=>viewCb('centerZ', e.target.value)} />
                    <label className="formLabel small">upX</label>
                    <input type="number" className="form tiny" defaultValue={view.upX} step="1" onChange={(e)=>viewCb('upX', e.target.value)} />
                    <label className="formLabel small">upY</label>
                    <input type="number" className="form tiny" defaultValue={view.upY} step="1" onChange={(e)=>viewCb('upY', e.target.value)} />
                    <label className="formLabel small">upZ</label>
                    <input type="number" className="form tiny" defaultValue={view.upZ} step="1" onChange={(e)=>viewCb('upZ', e.target.value)} />
                </div>
                <h3>Projection</h3>
                <div>
                    <label className="formLabel">perspective</label>
                    <input type="radio" style={rdStyle} name="projType" defaultChecked={this.props.config.proj.perspec} onChange={()=>projCb('perspec')} />
                    <label className="formLabel small">fov</label>
                    <input type="number" className="form small" disabled={!this.props.config.proj.perspec} defaultValue={pers.fov} min="0" step="1" onChange={(e)=>projCb('perspec', 'fov', e.target.value)} />
                    <label className="formLabel small">aspect</label>
                    <input type="number" className="form small" readOnly={true} value={pers.aspect} />
                    <label className="formLabel small">near</label>
                    <input type="number" className="form small" disabled={!this.props.config.proj.perspec} defaultValue={pers.near} min="0" step="1" onChange={(e)=>projCb('perspec', 'near', e.target.value)} />
                    <label className="formLabel small">far</label>
                    <input type="number" className="form small" disabled={!this.props.config.proj.perspec} defaultValue={pers.far} min="0" step="1" onChange={(e)=>projCb('perspec', 'far', e.target.value)} />
                </div>
                <div>
                    <label className="formLabel">orthographic</label>
                    <input type="radio" style={rdStyle} name="projType" defaultChecked={this.props.config.proj.ortho} onChange={()=>projCb('ortho')} />
                    <label className="formLabel small">left</label>
                    <input type="number" className="form small" disabled={!this.props.config.proj.ortho} defaultValue={ortho.left} step="0.1" onChange={(e)=>projCb('ortho', 'left', e.target.value)} />
                    <label className="formLabel small">right</label>
                    <input type="number" className="form small" disabled={!this.props.config.proj.ortho} defaultValue={ortho.right} step="0.1" onChange={(e)=>projCb('ortho', 'right', e.target.value)} />
                    <label className="formLabel small">bottom</label>
                    <input type="number" className="form small" disabled={!this.props.config.proj.ortho} defaultValue={ortho.bottom} step="0.1" onChange={(e)=>projCb('ortho', 'bottom', e.target.value)} />
                    <label className="formLabel small">top</label>
                    <input type="number" className="form small" disabled={!this.props.config.proj.ortho} defaultValue={ortho.top} step="0.1" onChange={(e)=>projCb('ortho', 'top', e.target.value)} />
                    <label className="formLabel small">near</label>
                    <input type="number" className="form small" disabled={!this.props.config.proj.ortho} defaultValue={ortho.near} step="0.1" onChange={(e)=>projCb('ortho', 'near', e.target.value)} />
                    <label className="formLabel small">far</label>
                    <input type="number" className="form small" disabled={!this.props.config.proj.ortho} defaultValue={ortho.far} step="0.1" onChange={(e)=>projCb('ortho', 'far', e.target.value)} />
                </div>
            </div>
        );
    }
});

var Workspace = React.createClass({
    getInitialState: function() {
        return {
            width: 500,
            height: 300,
            modalMat: mat4.create(),
            clientX: null,
            clientY: null,
            scale: 1,
            config: {
                view: {
                    eyeX: 10,
                    eyeY: 10,
                    eyeZ: 10,
                    centerX: 0,
                    centerY: 0,
                    centerZ: 0,
                    upX: 0,
                    upY: 1,
                    upZ: 0
                },
                proj: {
                    ortho: false,
                    perspec: true
                },
                ortho: {
                    left: -10,
                    right: 10,
                    bottom: -10,
                    top: 10,
                    near: 0.1,
                    far: 20
                },
                perspec: {
                    fov: 30,
                    aspect: 5/3,
                    near: 0.1,
                    far: 20
                }
            }

        };
    },
    componentDidMount: function() {
        this.refs.canvas.width = this.state.width;
        this.refs.canvas.height = this.state.height;
        webGL.init(this.refs.canvas);
        webGL.draw(this.getMvpMat());
    },
    getMvpMat: function() {
        var vtemp = mat4.create();
        var view = this.state.config.view;
        var eye = vec3.fromValues(view.eyeX, view.eyeY, view.eyeZ);
        var center = vec3.fromValues(view.centerX, view.centerY, view.centerZ);
        var up = vec3.fromValues(view.upX, view.upY, view.upZ);
        mat4.lookAt(vtemp, eye, center, up);
        var ptemp = mat4.create();
        if (this.state.config.proj.ortho) {
            var ortho = this.state.config.ortho;
            mat4.ortho(ptemp, ortho.left, ortho.right, ortho.bottom, ortho.top, ortho.near, ortho.far);
        }
        else {
            var pers = this.state.config.perspec;
            mat4.perspective(ptemp, pers.fov * Math.PI / 180, pers.aspect, pers.near, pers.far);
        }
        var temp = mat4.create();
        mat4.multiply(temp, ptemp, vtemp);
        mat4.multiply(temp, temp, this.state.modalMat);
        return temp;
    },
    viewChangeCb: function(name, value) {
        value = +value;
        if (typeof value !== 'number') {
            value = 0;
        }
        switch (name) {
            case 'eyeX':
                this.state.config.view.eyeX = value;
                break;
            case 'eyeY':
                this.state.config.view.eyeY = value;
                break;
            case 'eyeZ':
                this.state.config.view.eyeZ = value;
                break;
            case 'centerX':
                this.state.config.view.centerX = value;
                break;
            case 'centerY':
                this.state.config.view.centerY = value;
                break;
            case 'centerZ':
                this.state.config.view.centerZ = value;
                break;
            case 'upX':
                this.state.config.view.upX = value;
                break;
            case 'upY':
                this.state.config.view.upY = value;
                break;
            case 'upZ':
                this.state.config.view.upZ = value;
                break;
        }
        webGL.draw(this.getMvpMat());
        return;
    },
    projChangeCb: function(type, name, value) {
        if (!name) {
            this.state.config.proj.perspec = !this.state.config.proj.perspec;
            this.state.config.proj.ortho = !this.state.config.proj.ortho;
        }
        else {
            value = +value;
            if (typeof value !== 'number') {
                value = 0;
            }
            if (type === 'perspec') {
                switch (name) {
                    case 'fov':
                        this.state.config.perspec.fov = value;
                        break;
                    case 'near':
                        this.state.config.perspec.near = value;
                        break;
                    case 'far':
                        this.state.config.perspec.far = value;
                        break;
                }   
            }
            else {
                switch (name) {
                    case 'left':
                        this.state.config.ortho.left = value;
                        break;
                    case 'right':
                        this.state.config.ortho.right = value;
                        break;
                    case 'bottom':
                        this.state.config.ortho.bottom = value;
                        break;
                    case 'top':
                        this.state.config.ortho.top = value;
                        break;
                    case 'near':
                        this.state.config.ortho.near = value;
                        break;
                    case 'far':
                        this.state.config.ortho.far = value;
                        break;
                }
            }
            
        }
        this.setState(this.state);
        webGL.draw(this.getMvpMat());
        return;
    },
    mousemoveCb: function(e) {
        if (this.state.clientX === null) {
            this.state.clientX = e.clientX;
            this.state.clientY = e.clientY;
        }
        else {
            var deltax = e.clientX - this.state.clientX;
            var deltay = e.clientY - this.state.clientY;
            this.state.clientX = e.clientX;
            this.state.clientY = e.clientY;
            var degX = Math.atan(deltax / 4000 / this.state.scale) / Math.PI * 180;
            var degY = Math.atan(deltay / 4000 / this.state.scale) / Math.PI * 180;
            mat4.rotateX(this.state.modalMat, this.state.modalMat, degX);
            mat4.rotateY(this.state.modalMat, this.state.modalMat, degY);
            webGL.draw(this.getMvpMat());

        }
    },
    scrollCb: function(e) {
        var s = e.deltaX ? e.deltaX / 10000 : (e.deltaY ? e.deltaY / 10000 : (e.deltaZ ? e.deltaZ /10000 : 0));
        this.state.scale = s + 1;
        if (this.state.scale < 0.01) {
            this.state.scale = 0.01;
        } 
        var svec = vec3.fromValues(this.state.scale, this.state.scale, this.state.scale);
        mat4.scale(this.state.modalMat, this.state.modalMat, svec);
        webGL.draw(this.getMvpMat());

    },
    render: function() {
        return (
            <div className="workspace">
            {
                this.props.state.active=='coord' ?
                <CoordFunc config={this.state.config} viewChangeCb={this.viewChangeCb} projChangeCb={this.projChangeCb} />
                : <LightFunc config={this.state.config} />
            }
                <canvas ref="canvas" onMouseMove={this.mousemoveCb} onWheel={this.scrollCb} />
            </div>
        );
    }
});
var App = React.createClass({
    getInitialState: function() {
        return {
            active: 'coord'
        }
    },
    switchCb: function(tab) {
        this.setState({
            active: tab
        });
    },
    render: function() {
        return (
            <div className = "main">
                <ul className="menu">
                    <li className={this.state.active=='coord' ? 'active' : ''} onClick={()=>this.switchCb('coord')}>Coordinate System</li>
                    <li className={this.state.active=='light' ? 'active' : ''} onClick={()=>this.switchCb('light')}>Light&Color</li>
                </ul>
                <Workspace state={this.state} />
            </div>
        );
    }
});

ReactDOM.render(
    <App />,
    document.getElementById('container')
);

