import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

import { GUI } from 'dat.gui'

// 导入后期效果合成器
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
// 导入渲染通道
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'


// three框架本身自带效果
import { DotScreenPass } from 'three/examples/jsm/postprocessing/DotScreenPass'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
// import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass'

// 自定义通道
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'


// 创建一个场景
const scene = new THREE.Scene();

// 创建相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

// 设置相机位置 xyz
camera.position.set(0, 0, 5)

scene.add(camera)

//创建gui对象
const gui = new GUI();

// 添加环境纹理
const cubeTextureLoader = new THREE.CubeTextureLoader();
const envMapTexture = cubeTextureLoader.load([
  "textures/env/0/px.jpg",
  "textures/env/0/nx.jpg",
  "textures/env/0/py.jpg",
  "textures/env/0/ny.jpg",
  "textures/env/0/pz.jpg",
  "textures/env/0/nz.jpg",
]);

scene.environment = envMapTexture
scene.background = envMapTexture

// 灯光
const directionLight = new THREE.DirectionalLight('#ffffff', 1);
// 投射阴影
directionLight.castShadow = true;
directionLight.position.set(0, 0, 200)
scene.add(directionLight)

// 设置模型

const gltfLoader = new GLTFLoader()
gltfLoader.load('./models/DamagedHelmet/glTF/DamagedHelmet.gltf', (gltf) => {
  // 获取 mesh 对象
  const mesh = gltf.scene.children[0]
  scene.add(mesh)
})

// 初始化渲染器
const renderer = new THREE.WebGLRenderer({ alpha: true })
// 设置渲染尺寸大小
renderer.setSize(window.innerWidth, window.innerHeight)
// 允许使用阴影
renderer.shadowMap.enabled = true;

// 合成效果
const effectComposer = new EffectComposer(renderer)
effectComposer.setSize(window.innerWidth, window.innerHeight)

// 添加渲染通道
const renderPass = new RenderPass(scene, camera)
effectComposer.addPass(renderPass)

// 噪点效果
const dotScreenPass = new DotScreenPass()
dotScreenPass.enabled = false // 是否使用
effectComposer.addPass(dotScreenPass)

// 抗锯齿
const smaaPass = new SMAAPass()
effectComposer.addPass(smaaPass)

// 发光效果
const unrealBloomPass = new UnrealBloomPass();
effectComposer.addPass(unrealBloomPass)

// 屏幕闪动
// const glitchPass = new GlitchPass()
// effectComposer.addPass(glitchPass)

renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1

unrealBloomPass.strength = 1
unrealBloomPass.radius = 0
unrealBloomPass.threshold = 1

gui.add(renderer, 'toneMappingExposure').min(0).max(2).step(0.01)

gui.add(unrealBloomPass, 'strength').min(0).max(2).step(0.01)
gui.add(unrealBloomPass, 'radius').min(0).max(2).step(0.01)
gui.add(unrealBloomPass, 'threshold').min(0).max(2).step(0.01)

const colorParams = {
  r: 0,
  g: 0,
  b: 0
}

// 着色器写渲染通道
const shaderPass = new ShaderPass({
  uniforms: {
    uColor: {
      value: new THREE.Color(colorParams.r, colorParams.g, colorParams.b)
    },
    tDiffuse: {
      value: null
    }
  },
  vertexShader: `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;

    uniform vec3 uColor;
    uniform sampler2D tDiffuse; // 当前页面纹理
    
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      color.xyz+=uColor;
      gl_FragColor = color;
    }
  `
})

effectComposer.addPass(shaderPass)

gui.add(colorParams, 'r').min(-1).max(1).step(0.01).onChange((value) => {
  shaderPass.uniforms.uColor.value.r = value;
});
gui.add(colorParams, 'g').min(-1).max(1).step(0.01).onChange((value) => {
  shaderPass.uniforms.uColor.value.g = value;
});
gui.add(colorParams, 'b').min(-1).max(1).step(0.01).onChange((value) => {
  shaderPass.uniforms.uColor.value.b = value;
});

const textureLoader = new THREE.TextureLoader()

const normalTexture = textureLoader.load('./textures/interfaceNormalMap.png');

const texturePass = new ShaderPass({
  uniforms: {
    tDiffuse: {
      value: null
    },
    uNormalMap: {
      value: normalTexture
    },
    uTime: {
      value: 0
    }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
    vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform sampler2D uNormalMap; // 法向纹理
    uniform sampler2D tDiffuse; // 当前页面纹理
    uniform float uTime;
    void main() {
      vec2 newUv = vUv;
      newUv += sin(newUv.x * 10.0 + uTime * 0.5) * 0.01;
      vec4 color = texture2D(tDiffuse, newUv);
      vec4 normalColor = texture2D(uNormalMap, vUv);
      // 设置光线的角度
      vec3 lightDirection = normalize(vec3(-5, 7, 1));
      float lightness = clamp(dot(normalColor.xyz, lightDirection), 0.0, 1.0);
      color.xyz += lightness;
      gl_FragColor = color;
    }
  `
})

effectComposer.addPass(texturePass)


// 将 webgl 的内容添加到 body
document.body.appendChild(renderer.domElement)

// 创建轨道控制器
const controls = new OrbitControls(camera, renderer.domElement)

const clock = new THREE.Clock()

// 设置阻尼
controls.enableDamping = true

function animate() {
  const time = clock.getElapsedTime()
  texturePass.uniforms.uTime.value = time
  // 帧回调函数
  requestAnimationFrame(animate);
  // 控制器更新
  controls.update();
  // 重新渲染
  // renderer.render(scene, camera);
  effectComposer.render()
}

// 初始化
animate()


window.addEventListener('resize', () => {
  // 更新摄像头
  camera.aspect = window.innerWidth / window.innerHeight;
  // 更新摄像机投影矩阵
  camera.updateProjectionMatrix();
  // 更新渲染器
  renderer.setSize(window.innerWidth, window.innerHeight);
  // 设置渲染器的像素比
  renderer.setPixelRatio(window.devicePixelRatio)

  effectComposer.setSize(window.innerWidth, window.innerHeight)
  effectComposer.setPixelRatio(window.devicePixelRatio)
})