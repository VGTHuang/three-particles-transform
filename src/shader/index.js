function getShader(shaderName) {
  try {
    var shader = require("./" + shaderName + ".glsl");
    return shader;
  } catch (err) {
    console.error("failed to get shader " + shaderName);
    return null;
  }
}

export { getShader };
