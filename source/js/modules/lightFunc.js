var React = require('react');
// webgl element
var webGL = require('../common/webgl');
var {mat3, mat4, vec3, vec4} = require('gl-matrix');

module.exports = React.createClass({
    getInitialState: function() {
        var vtemp = mat4.create();
        var eye = vec3.fromValues(10, 10, 10);
        var center = vec3.fromValues(0, 0, 0);
        var up = vec3.fromValues(0, 1, 0);
        mat4.lookAt(vtemp, eye, center, up);
        var ptemp = mat4.create();
        mat4.perspective(ptemp, 30 * Math.PI / 180, 5/3, 0.1, 20);

        return {
            width: 500,
            height: 300,
            modalMat: mat4.create(),
            viewMat: vtemp,
            projMat: ptemp,
            clientX: null,
            clientY: null,
            scale: 1,
            light: {
                ambient: [0.2, 0.2, 0.2],
                diffuse: [1.0, 1.0, 1.0],
                specular: [0.0, 0.0, 0.0],
                direction: [-1.0, 1.0, -1.0],
                position: [0.0, 1.0, 0.0],
                att_factors: [1.0, 1.0, 1.0],
                spot_exp: 1,
                spot_angle: 30
            },
            material: {
                ambient: [1.0, 0.0, 0.0],
                diffuse: [1.0, 0.0, 0.0],
                specular: [0.0, 0.0, 0.0],
                emmisive: [0.0, 0.0, 0.0],
                specular_exp: 1
            },
            lightType: 'direct',
            computeAtt: true
        }
    },
    componentDidMount: function() {
        this.refs.canvas.width = this.state.width;
        this.refs.canvas.height = this.state.height;
        if (webGL.init(this.refs.canvas, 'light')) {
            var list = this.getMvpMat();
            webGL.draw(list.concat(this.getLmtMat()));
        }
        
    },
    transColor: function(value) {
        var to, temp, n, num;
        if (typeof value === 'string') {
            // from #16 to array
            to = [];
            value = decodeURIComponent(value);
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
            return to;
        }
        else if (value.length && value.length >=3 ) {
            value.length = 3;
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
                this.state.lightType = 'point';
                break;
            case 'spot':
                this.state.lightType = 'spot';
                break;
        }
        this.setState(this.state);
        webGL.draw(this.getLmtMat());
    },
    // Lmt, light, material, type
    getLmtMat: function() {
        var uniList = [];
        var list = new Float32Array([
            this.state.material.ambient[0], this.state.material.ambient[1], this.state.material.ambient[2], 1.0,
            this.state.material.diffuse[0], this.state.material.diffuse[1], this.state.material.diffuse[2], 1.0,
            this.state.material.specular[0], this.state.material.specular[1], this.state.material.specular[2], 1.0,
            this.state.material.emmisive[0], this.state.material.emmisive[1], this.state.material.emmisive[2], 1.0
        ]);
        uniList.push({
            name: 'u_mat_mtl',
            value: list
        });
        list = new Float32Array([
            this.state.light.ambient[0], this.state.light.ambient[1], this.state.light.ambient[2], 1.0,
            this.state.light.diffuse[0], this.state.light.diffuse[1], this.state.light.diffuse[2], 1.0,
            this.state.light.specular[0], this.state.light.specular[1], this.state.light.specular[2], 1.0,
            this.state.light.direction[0], this.state.light.direction[1], this.state.light.direction[2], 1.0
        ]);
        uniList.push({
            name: 'u_mat_lgt',
            value: list
        });
        list = new Float32Array([this.state.light.position[0], this.state.light.position[1], this.state.light.position[2], 1.0]);
        uniList.push({
            name: 'u_position',
            value: list
        });
        list = new Float32Array([this.state.light.att_factors[0], this.state.light.att_factors[1], this.state.light.att_factors[2]]);
        uniList.push({
            name: 'u_att',
            value: list
        });
        list = new Float32Array([
            this.state.material.specular_exp,
            this.state.light.spot_exp,
            this.state.light.spot_angle
        ]);
        uniList.push({
            name: 'u_Arr_Exp',
            value: list
        });
        uniList.push({
            name: 'u_b_direct_light',
            value: this.state.lightType == 'direct' ? 1 : 0
        });
        uniList.push({
            name: 'u_b_dist_att',
            value: !!this.state.computeAtt ? 1 : 0
        });
        return uniList;
    },
    getMvpMat: function() {
        var matList = [];
        var temp = mat4.create();
        mat4.multiply(temp, this.state.projMat, this.state.viewMat);
        mat4.multiply(temp, temp, this.state.modalMat);
        matList.push({
            name: 'u_MvpMatrix',
            value: temp
        });
        temp = mat4.create();
        mat4.multiply(temp, this.state.viewMat, this.state.modalMat);
        matList.push({
            name: 'u_MvMatrix',
            value: temp
        });
        temp = mat4.create();
        mat4.invert(temp, this.state.modalMat);
        mat4.transpose(temp, temp);
        matList.push({
            name: 'u_MvInvertMatrix',
            value: temp
        });
        return matList;
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
            <div>
                <div className="func">
                    <h4>Material</h4>
                    <div>
                        <label className="formLabel">ambient color</label>
                        <input className="form tiny" type="color" defaultValue={this.transColor(material.ambient)} onChange={(e)=>materialCb('ambient', e.target.value)} />
                        <label className="formLabel">diffuse color</label>
                        <input className="form tiny" type="color" defaultValue={this.transColor(material.diffuse)} onChange={(e)=>materialCb('diffuse', e.target.value)} />
                        <label className="formLabel">specular color</label>
                        <input className="form tiny" type="color" defaultValue={this.transColor(material.specular)} onChange={(e)=>materialCb('specular', e.target.value)} />
                        <label className="formLabel">emmisive color</label>
                        <input className="form tiny" type="color" defaultValue={this.transColor(material.emmisive)} onChange={(e)=>materialCb('emmisive', e.target.value)} />
                        <label className="formLabel">specular exponent</label>
                        <input className="form tiny" type="number" defaultValue={material.specular_exp} step="0.1" onChange={(e)=>materialCb('exp', e.target.value)} />
                    </div>
                    <h4>Light</h4>
                    <div>
                        <label className="formLabel">ambient color</label>
                        <input className="form tiny" type="color" defaultValue={this.transColor(light.ambient)} onChange={(e)=>lightCb('ambient', e.target.value)} />
                        <label className="formLabel">diffuse color</label>
                        <input className="form tiny" type="color" defaultValue={this.transColor(light.diffuse)} onChange={(e)=>lightCb('diffuse', e.target.value)} />
                        <label className="formLabel">specular color</label>
                        <input className="form tiny" type="color" defaultValue={this.transColor(light.specular)} onChange={(e)=>lightCb('specular', e.target.value)} />
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
                        <input type="number" className="form tiny" disabled={type == 'point'} defaultValue={light.direction[0]} step="1" onChange={(e)=>lightCb('directX', e.target.value)} />
                        <input type="number" className="form tiny" disabled={type == 'point'} defaultValue={light.direction[1]} step="1" onChange={(e)=>lightCb('directY', e.target.value)} />
                        <input type="number" className="form tiny" disabled={type == 'point'} defaultValue={light.direction[2]} step="1" onChange={(e)=>lightCb('directZ', e.target.value)} />
                        <label className="formLabel">position</label>
                        <input type="number" className="form tiny" disabled={type == 'direct'} defaultValue={light.position[0]} step="1" onChange={(e)=>lightCb('positionX', e.target.value)} />
                        <input type="number" className="form tiny" disabled={type == 'direct'} defaultValue={light.position[1]} step="1" onChange={(e)=>lightCb('positionY', e.target.value)} />
                        <input type="number" className="form tiny" disabled={type == 'direct'} defaultValue={light.position[2]} step="1" onChange={(e)=>lightCb('positionZ', e.target.value)} />
                        <label className="formLabel">attenuate factors</label>
                        <input type="checkbox" disabled={type != 'direct'} defaultValue={bAtt} onChange={(e)=>lightCb('bAtt', e.target.value)} />
                        <input type="number" className="form tiny" disabled={type == 'direct'} defaultValue={light.att_factors[0]} step="1" onChange={(e)=>lightCb('attX', e.target.value)} />
                        <input type="number" className="form tiny" disabled={type == 'direct'} defaultValue={light.att_factors[1]} step="1" onChange={(e)=>lightCb('attY', e.target.value)} />
                        <input type="number" className="form tiny" disabled={type == 'direct'} defaultValue={light.att_factors[2]} step="1" onChange={(e)=>lightCb('attZ', e.target.value)} />
                        <label className="formLabel">spot exponent</label>
                        <input type="number" className="form tiny" disabled={type != 'spot'} defaultValue={light.spot_exp} step="0.1" onChange={(e)=>lightCb('exp', e.target.value)} />
                        <label className="formLabel">spot cutoff angle</label>
                        <input type="number" className="form tiny" disabled={type != 'spot'} defaultValue={light.spot_angle} step="1" onChange={(e)=>lightCb('angle', e.target.value)} />
                    </div>
                </div>
                <canvas ref="canvas" onMouseMove={this.mousemoveCb} onWheel={this.scrollCb} />
            </div>
        );
    }
});