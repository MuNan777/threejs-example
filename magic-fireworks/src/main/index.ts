import { createScene } from './createScene'
import Firework from '../model/firework'
import { Vector3 } from 'three';

const {
  scene,
  arrFn,
  camera
} = createScene()


window.addEventListener('click', (event) => {
  let color = `hsl(${Math.floor(Math.random() * 360)}, 100%, 80%)`;
  let vec = new Vector3(); // create once and reuse
  let position = new Vector3(); // create once and reuse
  vec.set(
    (event.clientX / window.innerWidth) * 2 - 1,
    - (event.clientY / window.innerHeight) * 2 + 1,
    0.5);
  vec.unproject(camera);
  vec.sub(camera.position).normalize();
  var distance = - camera.position.z / vec.z;
  position.copy(camera.position).add(vec.multiplyScalar(distance));
  const firework = new Firework(color, position)
  firework.addScene(scene, arrFn)
  console.log(arrFn)
})