uniform mat4 rotateMatrix;
attribute float randomize;
{0}
varying float existence; // whether particle exist or not

float nearSize = 10.0;
float near = -50.0;
float farSize = 1.0;
float far = -400.0;

float randomizeWeight(float weight) {
    float r = randomize * 0.4;
    float a = sqrt(0.5) / (0.5 - r);
    float b = a * r;
    if(weight < 0.5) {
        if(weight < r) {
            return 0.0;
        }
        else {
            float s = weight * a - b;
            return s * s;
        }
    }
    else {
        if(weight > 1.0 - r) {
            return 1.0;
        }
        else {
            float s = (1.0 - weight) * a - b;
            return 1.0 - s * s;
        }
    }
}

float getSize(float z) {
    if(z > near) {
        return nearSize;
    }
    float a = (farSize - nearSize) * far * near / (near - far);
    float b = farSize - a / far;
    return a / z + b;
}

void main() {
    vec4 newPosition = rotateMatrix*(
{1}
    );
    vec4 frustumPos = modelViewMatrix * vec4(vec3(newPosition), 1.0);
    gl_Position = projectionMatrix * frustumPos;
    gl_PointSize = getSize(frustumPos.z) * newPosition.w;
    existence = newPosition.w;
}