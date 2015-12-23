precision mediump float;

// transfer to fragment shader to calculate texture coordinate
varying vec4 v_Normal;
// calculated vertex color
varying vec4 v_Color;

void main(void) { 
    gl_FragColor = v_Color;
}