uniform float time;
attribute float randomize;
attribute vec4 pB;

void main() {
    vec3 newPosition = vec3(position)*time + vec3(pB)*(1.0-time);
    gl_Position = projectionMatrix
        * modelViewMatrix
        * vec4(newPosition, 1.0);
    gl_PointSize = 2.0;
}