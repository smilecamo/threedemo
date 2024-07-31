import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

let scene, camera, renderer, cube, controls, mixer, clipAction, gltfModel;
const width = window.innerWidth;
const height = window.innerHeight;
function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
  camera.position.set(0, 100, 200);
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
  renderer.setClearColor(0xffffff);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  const axesHelper = new THREE.AxesHelper(150);
  scene.add(axesHelper);
  const light = new THREE.AmbientLight(0xffffff); // 柔和的白光
  scene.add(light);
  loadModel();
}
function loadModel() {
  const loader = new GLTFLoader();
  loader.load("../../model/medieval_fantasy_book/scene.gltf", (gltf) => {
    gltfModel = gltf;
    scene.add(gltf.scene);
    animateAction();
    animate();
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
function animateAction() {
  console.log(gltfModel);
  mixer = new THREE.AnimationMixer(gltfModel.scene);
  clipAction = mixer.clipAction(gltfModel.animations[0]); //创建动画clipAction对象
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
