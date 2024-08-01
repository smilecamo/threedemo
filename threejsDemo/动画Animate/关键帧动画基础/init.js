import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
let scene, camera, renderer, cube, controls, mixer, clipAction;
const width = window.innerWidth;
const height = window.innerHeight;
function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(55, width / height, 1, 2000);
  camera.position.set(10, 0, 600);
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
  document.body.appendChild(renderer.domElement);
  const geometry = new THREE.BoxGeometry(55, 55, 55);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  cube = new THREE.Mesh(geometry, material);
  const axesHelper = new THREE.AxesHelper(150);
  cube.add(axesHelper);
  geometry.rotateY(Math.PI / 4); // 旋转
  scene.add(cube);
  animateAction();
  controls = new OrbitControls(camera, renderer.domElement);
  animate();
}
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const frameT = clock.getDelta();
  mixer.update(frameT);
  controls.update();
  renderer.render(scene, camera);
}
function animateAction() {
  //   动画
  cube.name = "cube";
  const times = [0, 3, 6]; // 时间轴
  const values = [0, 0, 0, 100, 0, 0, 0, 0, 100];
  const colors = [1, 0, 0, 0, 0, 1, 0, 1, 0];
  //   关键帧轨道(KeyframeTrack)是关键帧(keyframes)的定时序列, 它由时间和相关值的列表组成, 用来让一个对象的某个特定属性动起来。
  //   关键帧轨道(KeyframeTrack)中总是存在两个数组：times数组按顺序存储该轨道的所有关键帧的时间值，而values数组包含动画属性的相应更改值。
  //   name - 关键帧轨道(KeyframeTrack)的标识符.
  // times - 关键帧的时间数组, 被内部转化为 Float32Array.
  // values - 与时间数组中的时间点相关的值组成的数组, 被内部转化为 Float32Array.
  const posKF = new THREE.KeyframeTrack("cube.position", times, values);
  const posKF2 = new THREE.KeyframeTrack("cube.material.color", times, colors);
  //    动画剪辑（AnimationClip）是一个可重用的关键帧轨道集，它代表动画。
  //   name - 此剪辑的名称
  // duration - 持续时间 (单位秒). 如果传入负数, 持续时间将会从传入的数组中计算得到。
  // tracks - 一个由关键帧轨道（KeyframeTracks）组成的数组。
  const clip = new THREE.AnimationClip("clipTest", 6, [posKF, posKF2]);
  //   AnimationMixer  动画混合器是用于场景中特定对象的动画的播放器。当场景中的多个对象独立动画时，每个对象都可以使用同一个动画混合器。
  mixer = new THREE.AnimationMixer(cube);
  //AnimationMixer的`.clipAction()`返回一个AnimationAction对象
  clipAction = mixer.clipAction(clip);
  //.play()控制动画播放，默认循环播放
  clipAction.play();
  handleAnimateMethod();
}

function handleAnimateMethod() {
  let timeScale = 1;
  let loop = true;
  clipAction.paused = true;
  document.getElementById("play").addEventListener("click", (e) => {
    clipAction.paused = !clipAction.paused;
    clipAction.paused
      ? (e.target.innerHTML = "播放")
      : (e.target.innerHTML = "暂停");
  });
  document.getElementById("scale").addEventListener("click", (e) => {
    clipAction.timeScale = timeScale === 1 ? 10 : 1;
  });
  document.getElementById("next").addEventListener("click", (e) => {
    clipAction.paused = true;
    clipAction.time += 1;
  });
  document.getElementById("loop").addEventListener("click", (e) => {
    if (loop) {
      clipAction.loop = THREE.LoopOnce;
      loop = false;
      e.target.innerHTML = "不循环";
    } else {
      clipAction.loop = THREE.LoopRepeat;
      loop = true;
      e.target.innerHTML = "循环";
    }
  });
}
init();
