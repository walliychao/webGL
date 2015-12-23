module.exports = {
    coord: {
        vShaderSource: [
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
        ].join('\r\n'),
        fShaderSource: [
            'precision mediump float;' +
            //'uniform sampler2D u_Sampler;' +
            //'varying vec2 v_TexCoord;' +
            'varying vec4 v_Color;' +
            'void main(void) {' +
                //'gl_FragColor = texture2D(u_Sampler, v_TexCoord);' +
                'gl_FragColor = v_Color;' +
            '}'
        ].join('\r\n'),
        attributes: [
            {
                name: 'a_Position',
                size: 3,
                strip: 6,
                offset: 0
            },
            {
                name: 'a_Color',
                size: 3,
                strip: 6,
                offset: 3
            }
        ],
        uniforms: [
            {
                name: 'u_MvpMatrix',
                type: 'mat4',
                location: null,
                value: null
            }
        ],
        vertices: new Float32Array([
             1.0,  1.0,  1.0,  1.0, 1.0, 1.0,  // v0
            -1.0,  1.0,  1.0,  0.0, 1.0, 1.0,  // v1
            -1.0, -1.0,  1.0,  0.0, 0.0, 1.0,  // v2
             1.0, -1.0,  1.0,  1.0, 0.0, 1.0,  // v3
             1.0, -1.0, -1.0,  1.0, 0.0, 0.0,  // v4
             1.0,  1.0, -1.0,  1.0, 1.0, 0.0,  // v5
            -1.0,  1.0, -1.0,  0.0, 1.0, 0.0,  // v6
            -1.0, -1.0, -1.0,  0.0, 0.0, 0.0   // v7
        ]),
        indices: new Uint8Array([
            0, 1, 2,  0, 2, 3,                 // front
            0, 3, 4,  0, 4, 5,                 // right
            0, 5, 6,  0, 6, 1,                 // up
            1, 6, 7,  1, 7, 2,                 // left
            7, 4, 3,  7, 3, 2,                 // down
            4, 7, 6,  4, 6, 5                  // back
        ])
    },
    light: {
        vShaderSource: require('../../glsl/light_v.glsl'),
        fShaderSource: require('../../glsl/light_f.glsl'),
        attributes: [
            {
                name: 'a_Position',
                size: 3,
                strip: 6,
                offset: 0
            },
            {
                name: 'a_Normal',
                size: 3,
                strip: 6,
                offset: 3
            }
        ],
        uniforms: [
            {
                name: 'u_mat_mtl',
                type: 'mat4',
                location: null,
                value: null
            },
            {
                name: 'u_mat_lgt',
                type: 'mat4',
                location: null,
                value: null
            },
            {
                name: 'u_position',
                type: 'vec4',
                location: null,
                value: null
            },
            {
                name: 'u_att',
                type: 'vec3',
                location: null,
                value: null
            },
            {
                name: 'u_Arr_Exp',
                type: 'vec3',
                location: null,
                value: null
            },
            {
                name: 'u_b_direct_light',
                type: 'b',
                location: null,
                value: null
            },
            {
                name: 'u_b_dist_att',
                type: 'b',
                location: null,
                value: null
            },
            {
                name: 'u_MvpMatrix',
                type: 'mat4',
                location: null,
                value: null
            },
            {
                name: 'u_MvMatrix',
                type: 'mat4',
                location: null,
                value: null
            },
            {
                name: 'u_MvInvertMatrix',
                type: 'mat4',
                location: null,
                value: null
            }
        ],
        vertices: new Float32Array([
             1.0,  1.0,  1.0,   0.0, 0.0, -1.0,  // v0
            -1.0,  1.0,  1.0,   0.0, 0.0, -1.0, // v1
            -1.0, -1.0,  1.0,   0.0, 0.0, -1.0,  // v2
             1.0, -1.0,  1.0,   0.0, 0.0, -1.0,  // v3  front
             1.0,  1.0,  1.0,   1.0, 0.0, 0.0,  // v0
             1.0, -1.0,  1.0,   1.0, 0.0, 0.0,  // v3
             1.0, -1.0, -1.0,   1.0, 0.0, 0.0,  // v4
             1.0,  1.0, -1.0,   1.0, 0.0, 0.0,  // v5   right
             1.0,  1.0,  1.0,   0.0, 1.0, 0.0,  // v0
             1.0,  1.0, -1.0,   0.0, 1.0, 0.0,  // v5
            -1.0,  1.0, -1.0,   0.0, 1.0, 0.0,  // v6
            -1.0,  1.0,  1.0,   0.0, 1.0, 0.0,  // v1   up
            -1.0,  1.0,  1.0,  -1.0, 0.0, 0.0,  // v1
            -1.0,  1.0, -1.0,  -1.0, 0.0, 0.0,  // v6
            -1.0, -1.0, -1.0,  -1.0, 0.0, 0.0,  // v7
            -1.0, -1.0,  1.0,  -1.0, 0.0, 0.0,  // v2   left
            -1.0, -1.0, -1.0,   0.0, -1.0, 0.0,  // v7
             1.0, -1.0, -1.0,   0.0, -1.0, 0.0,  // v4
             1.0, -1.0,  1.0,   0.0, -1.0, 0.0,  // v3
            -1.0, -1.0,  1.0,   0.0, -1.0, 0.0,  // v2  down
             1.0, -1.0, -1.0,   0.0, 0.0, 1.0,  // v4
            -1.0, -1.0, -1.0,   0.0, 0.0, 1.0,   // v7
            -1.0,  1.0, -1.0,   0.0, 0.0, 1.0,  // v6
             1.0,  1.0, -1.0,   0.0, 0.0, 1.0   // v5   back
        ]),
        indices: new Uint8Array([
            0, 1, 2, 0, 2, 3,           // front
            4, 5, 6, 4, 6, 7,           // right
            8, 9, 10, 8, 10, 11,        // up
            12, 13, 14, 12, 14, 15,     // left
            16, 17, 18, 16, 18, 19,     // down
            20, 21, 22, 20, 22, 23      // back              
        ])
    }
};