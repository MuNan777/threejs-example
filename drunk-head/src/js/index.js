import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

// 创建一个场景
const scene = new THREE.Scene();

// 初始化渲染器
const renderer = new THREE.WebGLRenderer({ alpha: true })

// 创建相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

// 设置相机位置 xyz
camera.position.set(0, 0, 10)

scene.add(camera)

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

// 创建纹理加载器对象
const textureLoader = new THREE.TextureLoader();

// 创建背景板
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial()
)
plane.position.set(0, 0, -6);
// 接收阴影
plane.receiveShadow = true;
scene.add(plane)

// 设置模型
// 加载模型纹理
const modelTexture = textureLoader.load('./models/LeePerrySmith/color.jpg');
// 加载模型的法向纹理
const normalTexture = textureLoader.load('./models/LeePerrySmith/normal.jpg')
// 设置材质
const shaderMaterial = new THREE.MeshStandardMaterial({
  map: modelTexture, // 纹理
  normalMap: normalTexture
})
const modelUniform = {
  uTime: {
    value: 0
  }
}
shaderMaterial.onBeforeCompile = (shader) => {
  shader.uniforms.uTime = modelUniform.uTime
  shader.vertexShader = shader.vertexShader.replace(
    '#include <common>',
    `
    #include <common>
    // 旋转矩阵函数 https://thebookofshaders.com
    mat2 rotate2d(float _angle) {
      return mat2(
        cos(_angle),-sin(_angle),
        sin(_angle),cos(_angle)
      );
    }
    // 设置 uTime
    uniform float uTime;
    `
  )
  shader.vertexShader = shader.vertexShader.replace(
    '#include <begin_vertex>',
    `
    #include <begin_vertex>
    // 跟进 y 调整角度
    float angle = sin(position.y + uTime) * 0.4;
    mat2 rotateMatrix = rotate2d(angle);
    // 设置法线位置
    // <beginnormal_vertex> 内部将 normal 转换为 objectNormal
    // vec3 objectNormal = vec3( normal );
    objectNormal.xz = rotateMatrix * objectNormal.xz;
    // 设置矩阵位置
    transformed.xz = rotateMatrix * transformed.xz;
    `
  )
}

const depthMaterial = new THREE.MeshDepthMaterial({
  depthPacking: THREE.RGBADepthPacking
})

depthMaterial.onBeforeCompile = (shader) => {
  shader.uniforms.uTime = modelUniform.uTime
  shader.vertexShader = shader.vertexShader.replace(
    '#include <common>',
    `
    #include <common>
    // 旋转矩阵函数 https://thebookofshaders.com
    mat2 rotate2d(float _angle) {
      return mat2(
        cos(_angle),-sin(_angle),
        sin(_angle),cos(_angle)
      );
    }
    // 设置 uTime
    uniform float uTime;
    `
  )
  shader.vertexShader = shader.vertexShader.replace(
    '#include <begin_vertex>',
    `
    #include <begin_vertex>
    // 跟进 y 调整角度
    float angle = sin(position.y + uTime) * 0.4;
    mat2 rotateMatrix = rotate2d(angle);
    // 设置矩阵位置
    transformed.xz = rotateMatrix * transformed.xz;
    `
  )
}

const gltfLoader = new GLTFLoader()
gltfLoader.load('./models/LeePerrySmith/LeePerrySmith.glb', (gltf) => {
  // 获取 mesh 对象
  const mesh = gltf.scene.children[0]
  // 加入材质
  mesh.material = shaderMaterial
  // 阴影投射
  mesh.castShadow = true
  // 设置深度材质
  mesh.customDepthMaterial = depthMaterial
  scene.add(mesh)
})

// 坐标轴
// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

// 设置渲染尺寸大小
renderer.setSize(window.innerWidth, window.innerHeight)
// 将 webgl 的内容添加到 body
document.body.appendChild(renderer.domElement)
// 允许使用阴影
renderer.shadowMap.enabled = true;

// 创建轨道控制器
const controls = new OrbitControls(camera, renderer.domElement)

// 设置阻尼
controls.enableDamping = true

const clock = new THREE.Clock();

function animate() {
  const time = clock.getElapsedTime()
  // 设置 uTime
  modelUniform.uTime.value = time
  // 帧回调函数
  requestAnimationFrame(animate);
  // 控制器更新
  controls.update();
  // 重新渲染
  renderer.render(scene, camera);
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
})