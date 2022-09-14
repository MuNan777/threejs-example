import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export type animateFn = (allElapsedTime: number, index: number, arr: animateFn[]) => void

export function createScene () {
  // 创建一个场景
  const scene = new THREE.Scene();

  // 创建相机
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

  // 设置相机位置 xyz
  camera.position.set(0, 0, 50)

  scene.add(camera)

  // 灯光
  // 环境光 颜色、强调
  const light = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(light);
  // 平行光
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.castShadow = true
  scene.add(directionalLight);

  // 初始化渲染器
  const renderer = new THREE.WebGLRenderer({ alpha: true })
  // 设置渲染尺寸大小
  renderer.setSize(window.innerWidth, window.innerHeight)
  // 开启场景阴影
  renderer.shadowMap.enabled = true
  // renderer.physicallyCorrectLights = true

  // 将 webgl 的内容添加到 body
  document.body.appendChild(renderer.domElement)

  // 创建轨道控制器
  const controls = new OrbitControls(camera, renderer.domElement)

  // 设置阻尼
  controls.enableDamping = true

  const clock = new THREE.Clock()

  const arrFn: animateFn[] = []

  function animate () {
    // 时间
    const time = clock.getElapsedTime();
    // 执行回调
    arrFn.forEach((fn, index) => {
      fn(time, index, arrFn)
    })
    // 帧回调函数
    requestAnimationFrame(animate);
    // 控制器更新
    controls.update();
    // 重新渲染
    renderer.render(scene, camera);
  }

  // 添加坐标辅助器
  // const axesHelper = new THREE.AxesHelper(5);
  // scene.add(axesHelper);

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

  return {
    scene,
    camera,
    renderer,
    arrFn
  }
}