import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";


// 创建一个场景
const scene = new THREE.Scene();

// 创建相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

// 设置相机位置 xyz
camera.position.set(0, 0, 5);

scene.add(camera)

// 灯光
const dirLight = new THREE.DirectionalLight(0xffffff);
dirLight.position.set(0, 0, 1);
scene.add(dirLight);
const light = new THREE.AmbientLight(0xffffff, 0.5); // soft white light
scene.add(light);

// 渲染
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio)

// 加载纹理
const textureLoader = new THREE.TextureLoader();

const earthGeometry = new THREE.SphereGeometry(1, 24, 24)
const earthMaterial = new THREE.MeshPhongMaterial({
  specular: 0x33333, // 材质的高光颜色。默认值为 0x111111
  shininess: 5, // 高亮的程度，越高的值越闪亮
  map: textureLoader.load('./textures/earth_atmos_2048.jpg'), // 纹理
  normalMap: textureLoader.load('./textures/earth_normal_2048.jpg'), // 法线纹理
  specularMap: textureLoader.load('./textures/earth_specular_2048.jpg'), // 镜面反射贴图值会影响镜面高光以及环境贴图对表面的影响程度
  normalScale: new THREE.Vector2(0.85, 0.85), // 法线贴图对材质的影响程度 0 ~ 1
})

const earth = new THREE.Mesh(earthGeometry, earthMaterial);
// earth.rotation.y = Math.PI;
scene.add(earth)

const moonGeometry = new THREE.SphereGeometry(0.27, 24, 24);
const moonMaterial = new THREE.MeshPhongMaterial({
  specular: 0x33333,
  shininess: 5,
  map: textureLoader.load("textures/moon_1024.jpg"),
});

const moon = new THREE.Mesh(moonGeometry, moonMaterial);
scene.add(moon);

// 添加提示标签
const earthDiv = document.createElement('div');
earthDiv.className = "label";
earthDiv.innerHTML = "地球";
const earthLabel = new CSS2DObject(earthDiv);
earthLabel.position.set(0, 1.2, 0);
earth.add(earthLabel)

const moonDiv = document.createElement('div');
moonDiv.className = "label";
moonDiv.innerHTML = "月球";
const moonLabel = new CSS2DObject(moonDiv);
moonLabel.position.set(0, 0.4, 0);
moon.add(moonLabel)

const chinaDiv = document.createElement('div');
chinaDiv.className = "labelChina";
chinaDiv.innerHTML = "中国";
const chinaLabel = new CSS2DObject(chinaDiv);
chinaLabel.position.set(-0.2, 0.65, -0.9);
earth.add(chinaLabel)


// 实例化css2d的渲染器
const css2DRenderer = new CSS2DRenderer();
css2DRenderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(css2DRenderer.domElement)
css2DRenderer.domElement.style.position = 'absolute'
css2DRenderer.domElement.style.top = '0px'
css2DRenderer.domElement.style.left = '0px'
css2DRenderer.domElement.style.zIndex = '10'


// 将 webgl 的内容添加到 body
document.body.appendChild(renderer.domElement)


// 创建轨道控制器
const controls = new OrbitControls(camera, css2DRenderer.domElement)

const clock = new THREE.Clock()

// 设置阻尼
controls.enableDamping = true

// 实例化射线
const raycaster = new THREE.Raycaster()

function animate() {
  const time = clock.getElapsedTime()
  // 设置月球旋转
  moon.position.set(Math.sin(time * 0.5) * 3, 0, Math.cos(time * 0.5) * 3)
  // 处理遮盖隐藏
  const chinaPosition = chinaLabel.position.clone()
  // 计算出标签跟摄像机的距离
  const labelDistance = chinaPosition.distanceTo(camera.position);
  // 检测射线的碰撞
  // chinaLabel.position
  // 向量(坐标)从世界空间投影到相机的标准化设备坐标 (NDC) 空间
  chinaPosition.project(camera)
  // 通过摄像机和目标位置更新射线
  raycaster.setFromCamera(chinaPosition, camera);
  // 计算物体和射线的焦点
  const intersects = raycaster.intersectObjects(scene.children, true)
  console.log(intersects)
  // 如果没有碰撞到任何物体，那么让标签显示
  if (intersects.length == 0) {
    chinaLabel.element.classList.add('visible');
  } else {
    const minDistance = intersects[0].distance;
    if (minDistance < labelDistance) {
      chinaLabel.element.classList.remove('visible');
    } else {
      chinaLabel.element.classList.add('visible');
    }
  }
  // 帧回调函数
  requestAnimationFrame(animate);
  // 控制器更新
  controls.update();
  // 重新渲染
  renderer.render(scene, camera);
  // 重新渲染 css2d
  css2DRenderer.render(scene, camera);
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
  css2DRenderer.setSize(window.innerWidth, window.innerHeight);
  // 设置渲染器的像素比
  renderer.setPixelRatio(window.devicePixelRatio)
})