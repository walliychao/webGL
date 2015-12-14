var React = require('react');

const vertexShaderSource = [
    'attribute vec4 a_Position;' +
    'attribute vec4 a_Color;' +
    //'attribute vec2 a_TexCoord;' +
    'uniform mat4 u_MvpMatrix;' +
    //'varying vec2 v_TexCoord;' +
    'varying vec4 v_Color;' +
    'void main(void) {' +
    '   gl_Position = u_MvpMatrix * a_Position;' +
    //'   v_TexCoord = a_TexCoord;' +
    'v_Color = a_Color;' +
    '}'
].join('\r\n');

const fragmentShaderSource = [
    'precision mediump float;' +
    //'uniform sampler2D u_Sampler;' +
    //'varying vec2 v_TexCoord;' +
    'varying vec4 v_Color;' +
    'void main(void) {' +
        //'gl_FragColor = texture2D(u_Sampler, v_TexCoord);' +
        'gl_FragColor = v_Color;' +
    '}'
].join('\r\n');

var gl;

var initVertexBuffers = function() {
    var vertices = new Float32Array([
         1.0,  1.0,  1.0,  1.0, 1.0, 1.0,  // v0
        -1.0,  1.0,  1.0,  0.0, 1.0, 1.0,  // v1
        -1.0, -1.0,  1.0,  0.0, 0.0, 1.0,  // v2
         1.0, -1.0,  1.0,  1.0, 0.0, 1.0,  // v3
         1.0, -1.0, -1.0,  1.0, 0.0, 0.0,  // v4
         1.0,  1.0, -1.0,  1.0, 1.0, 0.0,  // v5
        -1.0,  1.0, -1.0,  0.0, 1.0, 0.0,  // v6
        -1.0, -1.0, -1.0,  0.0, 0.0, 0.0   // v7
    ]);

    var indices = new Uint8Array([
        0, 1, 2,  0, 2, 3,                 // front
        0, 3, 4,  0, 4, 5,                 // right
        0, 5, 6,  0, 6, 1,                 // up
        1, 6, 7,  1, 7, 2,                 // left
        7, 4, 3,  7, 3, 2,                 // down
        4, 7, 6,  4, 6, 5                  // back
    ]);

    var vertexBuffer = gl.createBuffer();
    var indexBuffer = gl.createBuffer();
    if (!vertexBuffer || !indexBuffer) {
        console.log('fail to create buffer');
        return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var FSIZE = vertices.BYTES_PER_ELEMENT;

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('fail to get location of a_Position');
        return;
    }
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
    gl.enableVertexAttribArray(a_Position);

    // var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
    // if (a_TexCoord < 0) {
    //     console.log('fail to get location of a_TexCoord');
    //     return;
    // }
    // gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
    // gl.enableVertexAttribArray(a_TexCoord);

    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if (a_Color < 0) {
        console.log('fail to get location of a_Color');
        return;
    }
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    gl.enableVertexAttribArray(a_Color);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
};
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
module.exports = {
    init: function(canvas) {
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

            // init vertex shader
            var vertexShader = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vertexShader, vertexShaderSource);
            gl.compileShader(vertexShader);
            if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
                console.log(gl.getShaderInfoLog(vertexShader));
                return;
            }
            // init fragment shader
            var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fragmentShader, fragmentShaderSource);
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
            if (!gl.n) {
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

    draw: function(matrix) {
        var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
        if (u_MvpMatrix < 0) {
            console.log('fail to get location of u_MvpMatrix');
            return;
        }
        gl.uniformMatrix4fv(u_MvpMatrix, false, matrix);
        
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawElements(gl.TRIANGLES, gl.n, gl.UNSIGNED_BYTE, 0);
        

    }
}