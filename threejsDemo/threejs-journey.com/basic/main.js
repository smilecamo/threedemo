import NX from "./public/assets/textures/environmentMaps/0/nx.jpg";
import NY from "./public/assets/textures/environmentMaps/0/ny.jpg";
import NZ from "./public/assets/textures/environmentMaps/0/nz.jpg";
import PX from "./public/assets/textures/environmentMaps/0/px.jpg";
import PY from "./public/assets/textures/environmentMaps/0/py.jpg";
import PZ from "./public/assets/textures/environmentMaps/0/pz.jpg";

import * as dat from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const cubeTextLoader = new THREE.CubeTextureLoader();
const environmentMapTexture = cubeTextLoader.load([PX, NX, PY, NY, PZ, NZ]);

/**
 * basic setup
 */
const canvas = document.querySelector("canvas.webgl");
const gui = new dat.GUI();
// 创建音频对象用于播放碰撞音效

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const debugObject = {};
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
scene.add(floor);
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

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  renderer.setSize(sizes.width, sizes.height);
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
});

const clock = new THREE.Clock();
let oldElapsedTime = 0;
const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  // 计算两帧之间的时间差
  const deltaTime = elapsedTime - oldElapsedTime;
  // 更新上一帧的时间
  oldElapsedTime = elapsedTime;

  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};
tick();
