var React = require('react');
var ReactDOM = require('react-dom');
// webgl element
var webGL = require('../common/webgl');
var {mat3, mat4, vec3, vec4} = require('gl-matrix');

var LightFunc = React.createClass({
    getInitialState: function() {
        return {
            light: {
                ambient: [0.2, 0.2, 0.2, 1.0],
                diffuse: [1.0, 1.0, 1.0, 1.0],
                specular: [1.0, 1.0, 1.0, 1.0],
                direction: [0.0, -1.0, 0.0],
                position: [0.0, 1.0, 0.0],
                att_factors: [1.0, 1.0, 1.0],
                spot_exp: 1,
                spot_angle: 30
            },
            material: {
                ambient: [0.2, 0.2, 0.2, 1.0],
                diffuse: [1.0, 1.0, 1.0, 1.0],
                specular: [1.0, 1.0, 1.0, 1.0],
                emmisive: [0.0, 0.0, 0.0, 1.0],
                specular_exp: 1
            },
            lightType: 'direct',
            computeAtt: true
        }
    },
    transColor: function(value) {
        var to, temp, n, num;
        if (typeof value === 'string') {
            // from #16 to array
            to = [];
            value = decodeComponentURI(value);
            value = value.toLowerCase().replace(/[^0-9a-z]/g, '');
            for (var i = 0, l = value.length; i + 2 <= l; i += 2) {
                temp = value.substr(i, 2);
                n = temp.charCodeAt(0);
                if (n > 47 && n < 58) {
                    num = (n - 48) * 16;
                }
                else {
                    num = (n - 87) * 16;
                }
                n = temp.charCodeAt(1);
                if (n > 47 && n < 58) {
                    num += n - 48;
                }
                else {
                    num += n - 87;
                }
                to.push(num / 255);
            }
            to.push(1.0);
            return to;
        }
        else if (value.length && value.length >=3 ) {
            // from array to #16
            to = '';
            for (var i = 0, l = value.length; i < l; i++) {
                n = value[i] * 255;
                if (n > 255) {
                    n = 255;
                }
                if (n / 16 > 9) {
                    temp = String.fromCharCode(n / 16 + 87);
                }
                else {
                    temp = String.fromCharCode(n / 16 + 48);
                }
                if (n % 16 > 9) {
                    temp += String.fromCharCode(n % 16 + 87);
                }
                else {
                    temp += String.fromCharCode(n % 16 + 48);
                }
                to += temp;
            }
            return '#' + to;
        }
    },
    lightCb: function(name, value) {
        switch (name) {
            case 'ambient':
                this.state.light.ambient = this.transColor(value);
                break;
            case 'diffuse':
                this.state.light.diffuse = this.transColor(value);
                break;
            case 'specular':
                this.state.light.specular = this.transColor(value);
                break;
            case 'directX':
                this.state.light.direction[0] = +value;
                break;
            case 'directY':
                this.state.light.direction[1] = +value;
                break;
            case 'directZ':
                this.state.light.direction[2] = +value;
                break;
            case 'positionX':
                this.state.light.position[0] = +value;
                break;
            case 'positionY':
                this.state.light.position[1] = +value;
                break;
            case 'positionZ':
                this.state.light.position[2] = +value;
                break;
            case 'attX':
                this.state.light.att_factors[0] = +value;
                break;
            case 'attY':
                this.state.light.att_factors[1] = +value;
                break;
            case 'attZ':
                this.state.light.att_factors[2] = +value;
                break;
            case 'bAtt':
                this.state.light.computeAtt = !this.state.light.computeAtt;
                break;
            case 'exp':
                this.state.light.spot_exp = +value;
                break;
            case 'angle':
                this.state.light.spot_angle = +value;
                break;
        }
        this.setState(this.state);
        webGL.draw(this.getLmtMat());
    },
    materialCb: function(name, value) {
        switch (name) {
            case 'ambient':
                this.state.material.ambient = this.transColor(value);
                break;
            case 'diffuse':
                this.state.material.diffuse = this.transColor(value);
                break;
            case 'specular':
                this.state.material.specular = this.transColor(value);
                break;
            case 'emmisive':
                this.state.material.emmisive = this.transColor(value);
                break;
            case 'exp':
                this.state.material.specular_exp = +value;
                break;
        }
        this.setState(this.state);
        webGL.draw(this.getLmtMat());
    },
    typeCb: function(name, value) {
        switch (name) {
            case 'direct':
                this.state.lightType = 'direct';
                break;
            case 'point':
                this.state.lightType = 'direct';
                break;
            case 'spot':
                this.state.lightType = 'direct';
                break;
        }
        this.setState(this.state);
        webGL.draw(this.getLmtMat());
    },
    // Lmt, light, material, type
    getLmtMat: function() {
        var uniList = [];
        var materialList = [
            vec4.fromValues(this.state.material.ambient[0], this.state.material.ambient[1], this.state.material.ambient[2], this.state.material.ambient[3]),
            vec4.fromValues(this.state.material.diffuse[0], this.state.material.diffuse[1], this.state.material.diffuse[2], this.state.material.diffuse[3]),
            vec4.fromValues(this.state.material.specular[0], this.state.material.specular[1], this.state.material.specular[2], this.state.material.specular[3]),
            vec4.fromValues(this.state.material.emmisive[0], this.state.material.emmisive[1], this.state.material.emmisive[2], this.state.material.emmisive[3])
        ];
        uniList.push({
            name: 'u_Arr_Material',
            value: materialList
        });
        var lightList = [
            vec3.fromValues(this.state.light.ambient[0], this.state.light.ambient[1], this.state.light.ambient[2], this.state.light.ambient[3]),
            vec3.fromValues(this.state.light.diffuse[0], this.state.light.diffuse[1], this.state.light.diffuse[2], this.state.light.diffuse[3]),
            vec3.fromValues(this.state.light.specular[0], this.state.light.specular[1], this.state.light.specular[2], this.state.light.specular[3]),
            vec3.fromValues(this.state.light.direction[0], this.state.light.direction[1], this.state.light.direction[2], this.state.light.direction[3]),
            vec3.fromValues(this.state.light.position[0], this.state.light.position[1], this.state.light.position[2], this.state.light.ambient[3]),
            vec3.fromValues(this.state.light.att_factors[0], this.state.light.att_factors[1], this.state.light.att_factors[2], this.state.light.ambient[3]),
        ];
        uniList.push({
            name: 'u_Arr_Light',
            value: lightList
        });
        var expList = [
            this.state.material.specular_exp,
            this.state.light.spot_exp,
            this.state.light.spot_angle
        ];
        uniList.push({
            name: 'u_Arr_Exp',
            value: expList
        });
        uniList.push({
            name: 'u_b_direct_light',
            value: this.state.lightType == 'direct'
        });
        uniList.push({
            name: 'u_b_dist_att',
            value: !!this.state.computeAtt
        });
        return uniList;
    },
    render: function() {
        var light = this.state.light;
        var material = this.state.material;
        var bAtt = this.state.computeAtt;
        var type = this.state.lightType;
        var materialCb = this.materialCb;
        var lightCb = this.lightCb;
        var rdStyle = {
            verticalAlign: 'middle',
            marginTop: '4px'
        };
        return (
            <div className="func">
                <h3>Material</h3>
                <div>
                    <label className="formLabel">ambient color</label>
                    <input className="form" type="color" defaultValue={this.transColor(material.ambient)} onChange={(e)=>materialCb('ambient', e.target.value)} />
                    <label className="formLabel">diffuse color</label>
                    <input className="form" type="color" defaultValue={this.transColor(material.diffuse)} onChange={(e)=>materialCb('diffuse', e.target.value)} />
                    <label className="formLabel">specular color</label>
                    <input className="form" type="color" defaultValue={this.transColor(material.specular)} onChange={(e)=>materialCb('specular', e.target.value)} />
                    <label className="formLabel">emmisive color</label>
                    <input className="form" type="color" defaultValue={this.transColor(material.emmisive)} onChange={(e)=>materialCb('emmisive', e.target.value)} />
                    <label className="formLabel">specular exponent</label>
                    <input className="form tiny" type="number" defaultValue={material.specular_exp} step="0.1" onChange={(e)=>materialCb('exp', e.target.value)} />
                </div>
                <h3>Light</h3>
                <div>
                    <label className="formLabel">ambient color</label>
                    <input className="form" type="color" defaultValue={this.transColor(light.ambient)} onChange={(e)=>lightCb('ambient', e.target.value)} />
                    <label className="formLabel">diffuse color</label>
                    <input className="form" type="color" defaultValue={this.transColor(light.diffuse)} onChange={(e)=>lightCb('diffuse', e.target.value)} />
                    <label className="formLabel">specular color</label>
                    <input className="form" type="color" defaultValue={this.transColor(light.specular)} onChange={(e)=>lightCb('specular', e.target.value)} />
                </div>
                <div>
                    <label className="formLabel">directional light</label>
                    <input type="radio" style={rdStyle} name="lightType" defaultChecked={type == 'direct'} onChange={()=>typeCb('direct')} />
                    <label className="formLabel">point light</label>
                    <input type="radio" style={rdStyle} name="lightType" defaultChecked={type == 'point'} onChange={()=>typeCb('point')} />
                    <label className="formLabel">spot light</label>
                    <input type="radio" style={rdStyle} name="lightType" defaultChecked={type == 'spot'} onChange={()=>typeCb('spot')} />
                </div>
                <div>
                    <label className="formLabel">direction</label>
                    <input type="number" className="form tiny" disabled={type != 'point'} defaultValue={light.direction[0]} step="1" onChange={(e)=>lightCb('directX', e.target.value)} />
                    <input type="number" className="form tiny" disabled={type != 'point'} defaultValue={light.direction[1]} step="1" onChange={(e)=>lightCb('directY', e.target.value)} />
                    <input type="number" className="form tiny" disabled={type != 'point'} defaultValue={light.direction[2]} step="1" onChange={(e)=>lightCb('directZ', e.target.value)} />
                </div>
                <div>
                    <label className="formLabel">position</label>
                    <input type="number" className="form tiny" disabled={type != 'direct'} defaultValue={light.position[0]} step="1" onChange={(e)=>lightCb('positionX', e.target.value)} />
                    <input type="number" className="form tiny" disabled={type != 'direct'} defaultValue={light.position[1]} step="1" onChange={(e)=>lightCb('positionY', e.target.value)} />
                    <input type="number" className="form tiny" disabled={type != 'direct'} defaultValue={light.position[2]} step="1" onChange={(e)=>lightCb('positionZ', e.target.value)} />
                </div>
                <div>
                    <label className="formLabel">attenuate factors</label>
                    <input type="checkbox" disabled={type != 'direct'} defaultValue={bAtt} onChange={(e)=>lightCb('bAtt', e.target.value)} />
                    <input type="number" className="form tiny" disabled={type != 'direct'} defaultValue={light.att_factors[0]} step="1" onChange={(e)=>lightCb('attX', e.target.value)} />
                    <input type="number" className="form tiny" disabled={type != 'direct'} defaultValue={light.att_factors[1]} step="1" onChange={(e)=>lightCb('attY', e.target.value)} />
                    <input type="number" className="form tiny" disabled={type != 'direct'} defaultValue={light.att_factors[2]} step="1" onChange={(e)=>lightCb('attZ', e.target.value)} />
                </div>
                <div>
                    <label className="formLabel">spot exponent</label>
                    <input type="number" className="form tiny" disabled={type == 'spot'} defaultValue={light.spot_exp} step="0.1" onChange={(e)=>lightCb('exp', e.target.value)} />
                    <label className="formLabel">spot cutoff angle</label>
                    <input type="number" className="form tiny" disabled={type == 'spot'} defaultValue={light.spot_angle} step="1" onChange={(e)=>lightCb('angle', e.target.value)} />
                </div>
            </div>
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
            </div>);
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
            coord: {
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
        var matList = [];
        var vtemp = mat4.create();
        var view = this.state.coord.view;
        var eye = vec3.fromValues(view.eyeX, view.eyeY, view.eyeZ);
        var center = vec3.fromValues(view.centerX, view.centerY, view.centerZ);
        var up = vec3.fromValues(view.upX, view.upY, view.upZ);
        mat4.lookAt(vtemp, eye, center, up);
        var ptemp = mat4.create();
        if (this.state.coord.proj.ortho) {
            var ortho = this.state.coord.ortho;
            mat4.ortho(ptemp, ortho.left, ortho.right, ortho.bottom, ortho.top, ortho.near, ortho.far);
        }
        else {
            var pers = this.state.coord.perspec;
            mat4.perspective(ptemp, pers.fov * Math.PI / 180, pers.aspect, pers.near, pers.far);
        }
        var temp = mat4.create();
        mat4.multiply(temp, ptemp, vtemp);
        mat4.multiply(temp, temp, this.state.modalMat);
        matList.push({
            name: 'u_MvpMatrix',
            value: temp
        });
        temp = mat4.create();
        mat4.multiply(temp, vtemp, this.state.modalMat);
        matList.push({
            name: 'u_MvMatrix',
            value: temp
        });
        temp = mat4.create();
        mat4.invert(temp, this.state.modalMat);
        mat4.transpost(temp, temp);
        mat4.multiply(temp, vtemp, temp);
        matList.push({
            name: 'u_MvInvertMatrix',
            value: temp
        });
        return matList;
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
                <CoordFunc config={this.state.coord} viewChangeCb={this.viewChangeCb} projChangeCb={this.projChangeCb} />
                : <LightFunc />
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

