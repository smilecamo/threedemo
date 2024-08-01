import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
let scene,
  camera,
  renderer,
  cube,
  controls,
  mixer,
  clipAction,
  axesHelper,
  gui,
  group,
  model;
const width = window.innerWidth;
const height = window.innerHeight;
function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa0a0a0);
  scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);
  camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000);
  camera.position.set(2, 3, -6);
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);
  axesHelper = new THREE.AxesHelper(150);
  controls = new OrbitControls(camera, renderer.domElement);
  gui = new GUI();
  group = new THREE.Group();
  scene.add(group);
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);
  const dirLight = new THREE.DirectionalLight(0xffffff, 3);
  dirLight.position.set(-3, 10, -10);
  dirLight.castShadow = true;
  dirLight.shadow.camera.top = 4;
  dirLight.shadow.camera.bottom = -4;
  dirLight.shadow.camera.left = -4;
  dirLight.shadow.camera.right = 4;
  dirLight.shadow.camera.near = 0.1;
  dirLight.shadow.camera.far = 40;
  scene.add(dirLight);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: false })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  scene.add(mesh);
  LoadModel();
  animate();
}
// 骨骼
function bone() {
  const Bone1 = new THREE.Bone();
  const Bone2 = new THREE.Bone();
  const Bone3 = new THREE.Bone();
  Bone1.add(Bone2);
  Bone2.add(Bone3);
  group.add(Bone1);
  // SkeletonHelper会可视化参数模型对象所包含的所有骨骼关节
  const skeletonHelper = new THREE.SkeletonHelper(group);
  group.add(skeletonHelper);
}
function LoadModel() {
  const loader = new GLTFLoader();
  loader.load("../../model/Soldier.glb", function (gltf) {
    console.log(gltf);
    scene.add(gltf.scene);
    // 骨骼辅助线
    const skeletonHelper = new THREE.SkeletonHelper(gltf.scene);
    scene.add(skeletonHelper);
    gltf.scene.traverse(function (object) {
      if (object.isMesh) object.castShadow = true;
    });
    clickAnimate(gltf);
  });
}
// 通过权重控制
function clickAnimate(gltf) {
  mixer = new THREE.AnimationMixer(gltf.scene);
  const run = mixer.clipAction(gltf.animations[1]);
  const idle = mixer.clipAction(gltf.animations[0]);
  const TPose = mixer.clipAction(gltf.animations[2]);
  const walk = mixer.clipAction(gltf.animations[3]);
  let currentClip = idle;
  run.play();
  idle.play();
  walk.play();
  TPose.play();
  // weight为0，不播放动画
  run.weight = 0;
  idle.weight = 1;
  TPose.weight = 0;
  walk.weight = 0;
  document.getElementById("run").addEventListener("click", function () {
    currentClip.weight = 0;
    currentClip = run;
    run.weight = 1;
  });
  document.getElementById("idle").addEventListener("click", function () {
    currentClip.weight = 0;
    currentClip = idle;
    idle.weight = 1;
  });
  document.getElementById("TPose").addEventListener("click", function () {
    currentClip.weight = 0;
    currentClip = TPose;
    TPose.weight = 1;
  });
  document.getElementById("walk").addEventListener("click", function () {
    currentClip.weight = 0;
    currentClip = walk;
    walk.weight = 1;
  });
}
// 通过 stop和play控制动画
// function clickAnimate(gltf) {
//   mixer = new THREE.AnimationMixer(gltf.scene);
//   const run = mixer.clipAction(gltf.animations[1]);
//   const idle = mixer.clipAction(gltf.animations[0]);
//   const TPose = mixer.clipAction(gltf.animations[2]);
//   const walk = mixer.clipAction(gltf.animations[3]);
//   let currentClip = idle;
//   document.getElementById("run").addEventListener("click", function () {
//     currentClip.stop();
//     currentClip = run;
//     run.play();
//   });
//   document.getElementById("idle").addEventListener("click", function () {
//     currentClip.stop();
//     currentClip = idle;
//     idle.play();
//   });
//   document.getElementById("TPose").addEventListener("click", function () {
//     currentClip.stop();
//     currentClip = TPose;
//     TPose.play();
//   });
//   document.getElementById("walk").addEventListener("click", function () {
//     currentClip.stop();
//     currentClip = walk;
//     walk.play();
//   });
// }
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const frameT = clock.getDelta();
  mixer && mixer.update(frameT);
  controls.update();
  renderer.render(scene, camera);
}

init();
