import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
let scene, camera, renderer, cube, controls, mixer, clipAction, axesHelper, gui;
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

const width = window.innerWidth;
const height = window.innerHeight;
function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(55, width / height, 1, 2000);
  camera.position.set(10, 0, 600);
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
  document.body.appendChild(renderer.domElement);
  axesHelper = new THREE.AxesHelper(150);
  controls = new OrbitControls(camera, renderer.domElement);

  // 模型
  const geometry = new THREE.BoxGeometry(50, 50, 50);
  const geometryTarget1 = new THREE.BoxGeometry(50, 200, 50).attributes
    .position;
  const geometryTarget2 = new THREE.BoxGeometry(10, 50, 10).attributes.position;
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  /***
   * 变形动画
   * 1. 设置要变形的顶点数据 通过attributes.position获取
   * 2. 通过几何体的 morphAttributes.position 属性设置变形顶点数据
   * 3. 通过mesh的  morphTargetInfluences[0]=(0-1)  设置权重系数控制变形的程度 他是一个数组
   */
  geometry.morphAttributes.position = [geometryTarget1, geometryTarget2];
  cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  gui = new GUI();

  GUIAction();
  AnimateAction();
  animate();
}
// 通过关键帧动画控制变形动画
function AnimateAction() {
  cube.name = "Box";
  // 关键帧轨道(KeyframeTrack)是关键帧(keyframes)的定时序列, 它由时间和相关值的列表组成, 用来让一个对象的某个特定属性动起来。
  // KeyframeTrack( name : String, times : Array, values : Array, interpolation : Constant )
  const KF1 = new THREE.KeyframeTrack(
    "Box.morphTargetInfluences[0]",
    [0, 5],
    [0, 1]
  );
  const KF2 = new THREE.KeyframeTrack(
    "Box.morphTargetInfluences[1]",
    [5, 10],
    [0, 1]
  );
  /**
   * 关键帧动画
   * 1. 创建动画帧的播放器传入模型场景 const mixer = new THREE.AnimationMixer().AnimationClip(键帧轨道集)
   * 2. 通过构造出的播放器mixer.play
   */
  // 动画剪辑（AnimationClip）是一个可重用的关键帧轨道集，它代表动画。AnimationClip( name : String, duration : Number, tracks : Array )
  const clip = new THREE.AnimationClip("animate", 10, [KF1, KF2]);
  // 动画混合器是用于场景中特定对象的动画的播放器。当场景中的多个对象独立动画时，每个对象都可以使用同一个动画混合器。 AnimationMixer( rootObject : Object3D )
  mixer = new THREE.AnimationMixer(cube);
  // AnimationMixer.clipAction (clip : AnimationClip, optionalRoot : Object3D) : AnimationAction
  clipAction = mixer.clipAction(clip);
  clipAction.play();
}
// 通过GUI控制变形动画
function GUIAction() {
  const obj = {
    t1: 0,
    t2: 0,
    t3: 0,
  };
  gui
    .add(obj, "t1", 0, 1)
    .name("变形1")
    .onChange((e) => {
      cube.morphTargetInfluences[0] = e;
    });
  gui
    .add(obj, "t2", 0, 1)
    .name("变形2")
    .onChange((e) => {
      cube.morphTargetInfluences[1] = e;
    });
  gui
    .add(obj, "t3", 0, 1)
    .name("变形叠加")
    .onChange((e) => {
      cube.morphTargetInfluences[0] = e;
      cube.morphTargetInfluences[1] = e;
    });
}
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const frameT = clock.getDelta();
  mixer.update(frameT);
  controls.update();
  renderer.render(scene, camera);
}

init();
