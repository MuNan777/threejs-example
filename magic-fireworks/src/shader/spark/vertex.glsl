// 浮点数精度
precision lowp float;

attribute vec3 endPosition;
attribute float aSize;
uniform float uTime;
uniform float uSize;

void main() {
  // 设置位置
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  // 设置
  modelPosition.xyz += (endPosition * uTime);

  // 设置位置
  vec4 viewPosition = viewMatrix * modelPosition;
  gl_Position = projectionMatrix * viewPosition;

  // 设置点大小
  gl_PointSize = aSize * uSize;
}