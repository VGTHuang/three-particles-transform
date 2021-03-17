uniform float time;
attribute float randomize;
// attribute vec4 position;
attribute vec4 pA;
attribute vec4 pB;
attribute vec4 pC;
varying float existence; // whether particle exist or not

float nearSize = 10.0;
float near = -50.0;
float farSize = 1.0;
float far = -400.0;

float getSize(float z) {
    if(z > near) {
        return nearSize;
    }
    float a = (farSize - nearSize) * far * near / (near - far);
    float b = farSize - a / far;
    return a / z + b;
}

void main() {
    vec4 newPosition = vec4(pA)*time + vec4(position,1)*(1.0-time);
    vec4 frustumPos = modelViewMatrix * vec4(vec3(newPosition), 1.0);
    gl_Position = projectionMatrix * frustumPos;
    gl_PointSize = getSize(frustumPos.z) * newPosition.w;
    existence = newPosition.w;
}