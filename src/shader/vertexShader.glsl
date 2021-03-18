uniform mat4 rotateMatrix;
attribute float randomize;
{0}
varying float existence; // whether particle exist or not

float nearSize = 5.0;
float near = -50.0;
float farSize = 1.0;
float far = -500.0;
{1}

float randomizeWeight(float weight) {
    float r = randomize * 0.35;
    if(weight < r) {
        return 0.0;
    }
    else if(weight > (1.0 - r)) {
        return 1.0;
    }
    else {
        weight = (weight - r) / (1.0 - 2.0 * r);
        float a = (mod((r * 20.0), 1.0)) * 10.0 - 2.0;
        float b = -2.0 - 2.0 * a;
        float c = 3.0 + a;
        // ax^4+bx^3+cx^2 = ((ax+b)x+c)x^2
        float res = ((a * weight + b) * weight + c) * weight * weight;
        return res;
    }
}

float getWeightNorm2Len() {
    float weightSum = 0.0;
{2}
    return sqrt(weightSum);
}

float getSize(float z) {
    if(z > near) {
        return nearSize;
    }
    else if(z < far) {
        return farSize;
    }
    float a = (farSize - nearSize) * far * near / (near - far);
    float b = farSize - a / far;
    return a / z + b;
}

void main() {
{3}
    vec4 newPosition = rotateMatrix*(
{4}
    );
    vec4 frustumPos = modelViewMatrix * vec4(vec3(newPosition) * getWeightNorm2Len(), 1.0);
    
    gl_Position = projectionMatrix * frustumPos;
    gl_PointSize = getSize(frustumPos.z) * newPosition.w;
    existence = newPosition.w;
}