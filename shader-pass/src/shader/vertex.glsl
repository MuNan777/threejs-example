varying vec2 vUv;
uniform sampler2D uNormalMap; // 法向纹理
uniform sampler2D tDiffuse; // 当前页面纹理
uniform float uTime;
void main() {
  vec2 newUv = vUv;
  vec2 newUv += sin(newUv.x * 10.0 + uTime * 0.5) * 0.03;
  vec4 color = texture2D(tDiffuse, newUv);
  vec4 normalColor = texture2D(uNormalMap, vUv);
    // 设置光线的角度
  vec3 lightDirection = normalize(vec3(-5, 7, 1));
  float lightness = clamp(dot(normalColor.xyz, lightDirection), 0.0, 1.0);
  color.xyz += lightness;
  gl_FragColor = color;
}