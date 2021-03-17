function getShader(shaderName) {
  try {
    var shader = require("./" + shaderName + ".glsl");
    return shader;
  } catch (err) {
    console.error("failed to get shader " + shaderName);
    return null;
  }
}

function getShaderWithAttrs(shaderName, attrs) {
  try {
    var shader = require("./" + shaderName + ".glsl");
    attrs.forEach((attr, i) => {
      shader = shader.replace("{" + i + "}", attr);
    });
    return shader;
  } catch (err) {
    console.error("failed to get shader " + shaderName);
    return null;
  }
}

export { getShader, getShaderWithAttrs };
