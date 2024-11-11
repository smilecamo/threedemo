import NX from "./public/assets/textures/environmentMaps/0/nx.jpg";
import NY from "./public/assets/textures/environmentMaps/0/ny.jpg";
import NZ from "./public/assets/textures/environmentMaps/0/nz.jpg";
import PX from "./public/assets/textures/environmentMaps/0/px.jpg";
import PY from "./public/assets/textures/environmentMaps/0/py.jpg";
import PZ from "./public/assets/textures/environmentMaps/0/pz.jpg";

import * as dat from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
const cubeTextLoader = new THREE.CubeTextureLoader();
const environmentMapTexture = cubeTextLoader.load([PX, NX, PY, NY, PZ, NZ]);

/**
 * basic setup
 */
const canvas = document.querySelector("canvas.webgl");
const gui = new dat.GUI();
// 创建音频对象用于播放碰撞音效

// 定义窗口尺寸对象
const sizes = {
  width: window.innerWidth, // 获取浏览器窗口的宽度
  height: window.innerHeight, // 获取浏览器窗口的高度
};

// 创建一个调试对象，用于存储调试信息
const debugObject = {};

// 创建一个新的Three.js场景
const scene = new THREE.Scene();

/**
 * 灯光 平行光
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);
/**
 * 地板
 */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({
    color: "#777777",
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5,
  })
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
// scene.add(floor);
const sphereGeomatry = new THREE.SphereGeometry(0.7, 16, 16);
const sphereMaterial = new THREE.MeshBasicMaterial({
  color: "red",
});
let sphereArray = [];
const cerateSphere = (x) => {
  const material = sphereMaterial.clone();
  const sphere = new THREE.Mesh(sphereGeomatry, material);
  sphere.name = `sphere-${sphereArray.length}`;
  sphere.position.x = x;
  sphere.position.y = 1;
  sphere.castShadow = true;
  sphereArray.push(sphere);
  scene.add(sphere);
};
cerateSphere(-2);
cerateSphere(0);
cerateSphere(2);
// 1. 创建射线投射器
const rayCaster = new THREE.Raycaster();
// // 2. 设置射线起点和方向
// // 起点: 从x轴-3位置开始
// const rayOrigin = new THREE.Vector3(-3, 0, 0);
// // 方向: 沿着x轴正方向射出
// const rayDirection = new THREE.Vector3(1, 0, 0);
// // 设置射线投射器的起点和方向
// rayCaster.set(rayOrigin, rayDirection);
// // 3. 检测射线与物体的相交
// // 检测与单个球体的相交
// const raycasterResult = rayCaster.intersectObject(sphereArray[0]);
// // 检测与所有球体的相交
// const raycasterResults = rayCaster.intersectObjects(sphereArray);
// // raycasterResults返回一个数组,包含所有相交的物体信息
// // 每个结果包含:
// // - distance: 射线起点到相交点的距离
// // - point: 相交点的坐标
// // - face: 相交的面
// // - object: 相交的物体
/**
 * 相机
 */
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);
// 创建相机
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);
cameraGroup.add(camera);
camera.position.set(3, 4, 15);

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // 阻尼效果
const mouse = new THREE.Vector2(-10, -10);
/**
 * 监听鼠标事件
 * 讲鼠标位置转为 -1到1
 */
window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / sizes.width) * 2 - 1;
  mouse.y = -(event.clientY / sizes.height) * 2 + 1;
});
// 记录被选中的物体
let selectedObject = null;
// 监听鼠标点击事件 获取到是谁被点击了
window.addEventListener("click", () => {
  if (selectedObject) {
    console.log(selectedObject.name);
  }
});
/**
 * 监听窗口大小变化
 */
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  renderer.setSize(sizes.width, sizes.height);
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
});
/**
 * 加载模型
 */
let model = null;
const gltfLoader = new GLTFLoader();
gltfLoader.load(
  "./public/assets/models/Duck/glTF/Duck.gltf",
  (gltf) => {
    model = gltf.scene;
    console.log(model);
    scene.add(model);
  },
  (progress) => {
    console.log(progress);
  }
);
const clock = new THREE.Clock();
let oldElapsedTime = 0;
const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  // 计算两帧之间的时间差
  const deltaTime = elapsedTime - oldElapsedTime;
  // 更新上一帧的时间
  oldElapsedTime = elapsedTime;
  sphereArray[0].position.y = Math.sin(elapsedTime * 0.3) * 1.5;
  sphereArray[1].position.y = Math.sin(elapsedTime * 0.8) * 1.5;
  sphereArray[2].position.y = Math.sin(elapsedTime * 1.2) * 1.5;
  // 通过摄像机和鼠标位置更新射线
  rayCaster.setFromCamera(mouse, camera);
  const raycasterResults = rayCaster.intersectObjects(sphereArray);
  for (const object of sphereArray) {
    object.material.color.set("#ff00ff");
  }
  for (const result of raycasterResults) {
    result.object.material.color.set("#0000ff");
  }
  if (raycasterResults.length) {
    // 当selectedObject为空，且有射线相交结果时，说明鼠标刚刚进入物体区域
    if (selectedObject == null) {
      console.log("mouse enter");
    }
    selectedObject = raycasterResults[0].object;
  } else {
    // 当之前有选中物体，但现在射线没有相交结果时，说明鼠标离开了物体
    if (selectedObject) {
      console.log("mouse leave");
    }
    selectedObject = null;
  }
  if (model) {
    const modelIntersect = rayCaster.intersectObject(model);
    if (modelIntersect.length) {
      model.scale.set(2, 2, 2);
    } else {
      model.scale.set(1, 1, 1);
    }
  }
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};
tick();
