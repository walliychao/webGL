var resources = require('./resource');

var gl;

var initTextures = function(n) {
    var texture = gl.createTexture();
    if (!texture) {
        console.log('fail to create texture');
        return;
    }

    var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
    if (u_Sampler < 0) {
        console.log('fail to get location of u_Sampler');
        return;
    }

    var image = new Image();
    image.onload = function() {
        loadTexture(n, texture, u_Sampler, image);
    };
    image.src = require('../../images/flower.png');

    return true;
};
var loadTexture = function(n, texture, u_Sampler, image) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    gl.uniform1i(u_Sampler, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
};

var initAttributes = function(attr, FSIZE) {
    var a_Loc = gl.getAttribLocation(gl.program, attr.name);
    if (a_Loc < 0) {
        console.log('fail to get location of' + attr.name);
        return;
    }
    gl.vertexAttribPointer(a_Loc, attr.size, gl.FLOAT, false, FSIZE * attr.strip, attr.offset);
    gl.enableVertexAttribArray(a_Loc);
};

var initUniforms = function(uni) {
    if (!uni.location) {
        var u_Loc = gl.getUniformLocation(gl.program, uni.name);
        if (u_Loc < 0) {
            console.log('fail to get location of u_MvpMatrix');
            return;
        }
        
        // save uniform location to update value
        resources[gl.rName].uniforms[uni.name].location = u_Loc;
    }
    else {

    }
    if (uni.value) {
        try {
            switch (uni.type) {
                case 'mat4':
                gl.uniformMatrix4fv(u_Loc, false, uni.value);
                break;
                case 'mat3':
                gl.uniformMatrix3fv(u_Loc, false, uni.value);
                break;
                case 'vec4':
                gl.uniformVec4fv(u_Loc, false, uni.value);
                break;
                case 'vec3':
                gl.uniformVec3fv(u_Loc, false, uni.value);
                break;
                case 'f':
                gl.uniform1f(u_Loc, false, uni.value);
                break;
            }
        }
        catch(e) {}
    }
};

var updateUniforms = function(uniData) {
    var l = resources[gl.rName].uniforms.length;
    if (uniData.length != l) {
        console.log('unMatched uniforms, can not update.');
        return;
    }
    else {
        var temData;
        for (var i = 0; i < uniData.length; i++) {
            for (var j = 0; j < l; j++) {
                temData = resources[gl.rName].uniforms[j];
                if (tempData.name === uniData[i].name) {
                    tempData.value = uniData[i].value;
                    initUniforms(tempData);
                    break;
                }
            }
        }
    }
};

var initVertexBuffers = function() {
    var vertices = resources[gl.rName].vertices;
    var indices = resources[gl.rName].indices;

    var vertexBuffer = gl.createBuffer();
    var indexBuffer = gl.createBuffer();
    if (!vertexBuffer || !indexBuffer) {
        console.log('fail to create buffer');
        return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    var FSIZE = vertices.BYTES_PER_ELEMENT;
    
    // init attributes
    for (var i = 0, l = resources[gl.rName].attributes.length; i < l; i++) {
        initAttributes(resources[gl.rName].attributes[i], FSIZE);
    }

    // init uniforms
    for (var i = 0, l = resources[gl.rName].uniforms.length; i < l; i++) {
        initUniforms(resources[gl.rName].uniforms[i]);
    }

    return indices.length;
};

module.exports = {
    init: function(canvas, name = 'coord') {
        if (!resources[name]) {
            console.log('no resources named' + name);
            return;
        }
        try {
            // try get gl context
            gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        }
        catch(e) {}
        if (gl) {
            // initgl
            // init viewport
            gl.viewportWidth = canvas.width;
            gl.viewportHeight = canvas.height;
            gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

            // init app name
            gl.rName = name;

            // init vertex shader
            var vertexShader = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vertexShader, resources[name].vShaderSource);
            gl.compileShader(vertexShader);
            if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
                console.log(gl.getShaderInfoLog(vertexShader));
                return;
            }
            // init fragment shader
            var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fragmentShader, resources[name].fShaderSource);
            gl.compileShader(fragmentShader);
            if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
                console.log(gl.getShaderInfoLog(fragmentShader));
                return;
            }

            // init program
            gl.program = gl.createProgram();
            gl.attachShader(gl.program, vertexShader);
            gl.attachShader(gl.program, fragmentShader);
            gl.linkProgram(gl.program);
            if (!gl.getProgramParameter(gl.program, gl.LINK_STATUS)) {
                console.log('program link problem');
                return;
            }
            gl.useProgram(gl.program);

            gl.n = initVertexBuffers();
            if (gl.n <= 0) {
                console.log('fail to initialize vertex buffers');
                return;
            }
            // if (!initTextures(n)) {
            //     console.log('fail to initialize texture');
            // }

            // enable depth test
            gl.enable(gl.DEPTH_TEST);

            // clear color
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        }
        else {
            console.log('fail to initialize gl');
        }
    },

    draw: function(uniData) {
        if (updateUniforms(uniData)) {
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.drawElements(gl.TRIANGLES, gl.n, gl.UNSIGNED_BYTE, 0);
        }
        
    }
}