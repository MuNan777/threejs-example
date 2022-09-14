import { AdditiveBlending, AudioLoader, BufferAttribute, BufferGeometry, Clock, Color, ColorRepresentation, Points, Scene, ShaderMaterial, Audio, AudioListener } from "three"
import vertexShader from '../shader/vertex.glsl'
import fragmentShader from '../shader/fragment.glsl'
import sparkVertexShader from '../shader/spark/vertex.glsl'
import sparkFragmentShader from '../shader/spark/fragment.glsl'
import { animateFn } from "../main/createScene"

interface PositionType { x: number, y: number, z: number }

export default class Firework {
  material: ShaderMaterial
  geometry: BufferGeometry
  color: Color
  clock: Clock
  to: PositionType
  shootSound: Audio<GainNode>
  sound: Audio<GainNode>

  constructor(color: ColorRepresentation, to: PositionType, from = { x: 0, y: 0, z: 0 }) {
    this.color = new Color(color);
    this.clock = new Clock();
    this.to = to
    this.material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      blending: AdditiveBlending,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: {
          value: 0,
        },
        uSize: {
          value: 20,
        },
      }
    })
    this.geometry = new BufferGeometry()
    const bufferAttribute = new BufferAttribute(new Float32Array([from.x, from.y, from.z]), 3)
    this.geometry.setAttribute('position', bufferAttribute)
    this.geometry.setAttribute('endPosition',
      new BufferAttribute(
        new Float32Array(
          [
            to.x - from.x,
            to.y - from.y,
            0
          ]),
        3
      )
    )
  }

  addScene = (scene: Scene, arrFn: animateFn[]) => {
    const points = new Points(this.geometry, this.material)
    scene.add(points)
    arrFn.push((allElapsedTime: number, index: number, arrFn: animateFn[]) => {
      const elapsedTime = this.clock.getElapsedTime()
      if (elapsedTime < 1) {
        this.material.uniforms.uTime.value = elapsedTime
        this.material.uniforms.uSize.value = 20.0
      } else {
        // 让点消失
        this.material.uniforms.uSize.value = 0
        createSpark(this.clock, this.color, this.to, scene, arrFn)
        // 清除内存
        points.clear()
        this.geometry.dispose()
        this.material.dispose()
        // 清除动画回调
        arrFn = arrFn.splice(index, 1)
        // 清除出场景
        scene.remove(points)
      }
    })
  }
}

export function createSpark (clock: Clock, color: Color, from: PositionType, scene: Scene, arrFn: animateFn[], count: number = 150) {
  const sparkMaterial = new ShaderMaterial({
    vertexShader: sparkVertexShader,
    fragmentShader: sparkFragmentShader,
    blending: AdditiveBlending,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: {
        value: 0,
      },
      uSize: {
        value: 1,
      },
      uColor: { value: color },
    }
  })

  // 创建火花
  const sparGeometry = new BufferGeometry()
  const sparkCount = count + Math.floor(Math.random() * count);
  const sparkPosition = new Float32Array(sparkCount * 3);
  const sparkSize = new Float32Array(sparkCount);
  const sparkEndPosition = new Float32Array(sparkCount * 3);
  for (let i = 0; i < sparkCount; i++) {
    // 烟花开始位置
    sparkPosition[i * 3 + 0] = from.x;
    sparkPosition[i * 3 + 1] = from.y;
    sparkPosition[i * 3 + 2] = from.z;
    // 设置烟花粒子大小
    sparkSize[i] = Math.random() * 5 + 3;

    // 球的水平圆，随机角度
    let levelAngle = Math.random() * 2 * Math.PI
    // 球的垂直圆，随机角度
    let verAngle = Math.random() * 2 * Math.PI
    // 球半径
    let r = Math.random() * 10 + 10
    // 烟花结束位置
    sparkEndPosition[i * 3 + 0] = r * Math.sin(levelAngle) + r * Math.sin(verAngle)
    sparkEndPosition[i * 3 + 1] = r * Math.cos(levelAngle) + r * Math.cos(verAngle)
    sparkEndPosition[i * 3 + 2] = r * Math.sin(levelAngle) + r * Math.cos(verAngle)
  }
  sparGeometry.setAttribute('position',
    new BufferAttribute(sparkPosition, 3)
  )

  sparGeometry.setAttribute('aSize',
    new BufferAttribute(sparkSize, 1)
  )
  sparGeometry.setAttribute('endPosition',
    new BufferAttribute(sparkEndPosition, 3)
  )
  const sparks = new Points(
    sparGeometry,
    sparkMaterial
  );
  scene.add(sparks)
  arrFn.push((allElapsedTime: number, index: number, arrFn: animateFn[]) => {
    let elapsedTime = clock.getElapsedTime()
    elapsedTime = elapsedTime - 1
    if (elapsedTime < 1) {
      sparkMaterial.uniforms.uTime.value = elapsedTime
    } else if (elapsedTime < 2) {
      if (elapsedTime < 1.5) {
        sparkMaterial.uniforms.uTime.value = elapsedTime
      }
      sparkMaterial.uniforms.uSize.value = 2 - elapsedTime
    } else {
      // 清除内存
      sparks.clear()
      sparGeometry.dispose()
      sparkMaterial.dispose()
      // 清除动画回调
      arrFn = arrFn.splice(index, 1)
      // 清除出场景
      scene.remove(sparks)
    }
  })
}