precision mediump float;


uniform samplerCube u_samplerCube;

varying vec3 v_Normal;

void main(void) { 
    gl_FragColor = v_Color;
}