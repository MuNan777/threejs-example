// 浮点数精度
precision lowp float;

uniform vec3 uColor;

void main() {
  // 根据纹理采样颜色
  float rnd = distance(gl_PointCoord, vec2(0.5));
  rnd *= 2.0;
  rnd = 1.0 - rnd;
  gl_FragColor = vec4(rnd);
}