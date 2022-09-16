import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

import gsap from 'gsap'


// 创建一个场景
const scene = new THREE.Scene();

// 渲染
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio)

// 创建相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

// 设置相机位置 xyz
camera.position.set(0, 15, 15);

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

envMapTexture.mapping = THREE.CubeRefractionMapping;

scene.environment = envMapTexture
scene.background = envMapTexture

scene.add(new THREE.AmbientLight(0xffffff, 1));


const gltfLoader = new GLTFLoader();

const params = {
  value: 0
}

const material = new THREE.MeshPhongMaterial({
  color: 0xccddff,
  envMap: envMapTexture,
  refractionRatio: 0.98,
  reflectivity: 0.9,
  depthWrite: false,
  transparent: true,
  depthTest: false,
  opacity: 0.5,
})


gltfLoader.load('./models/Rosa4.glb', (r4) => {
  const mesh = r4.scene.children[0]
  mesh.material = material
  scene.add(r4.scene);
  const group = r4.scene.children[1]
  gltfLoader.load('./models/Rosa2.glb', function (r2) {
    for (let i = 0; i < group.children.length; i++) {
      group.children[i].geometry.morphAttributes.position = [r2.scene.children[1].children[i].geometry.attributes.position]
      group.children[i].updateMorphTargets()
      gsap.to(params, {
        value: 1,
        duration: 2,
        onUpdate: () => {
          group.children[i].morphTargetInfluences[0] = params.value
        }
      })
    }
  })
})


// 将 webgl 的内容添加到 body
document.body.appendChild(renderer.domElement)


// 创建轨道控制器
const controls = new OrbitControls(camera, renderer.domElement)

const clock = new THREE.Clock()

// 设置阻尼
controls.enableDamping = true

function animate() {
  let time = clock.getElapsedTime()

  controls.update()
  // 帧回调函数
  requestAnimationFrame(animate);
  // 重新渲染
  renderer.render(scene, camera);
}

// 初始化
animate()

// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);


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