import NX from "./public/assets/textures/environmentMaps/0/nx.jpg";
import NY from "./public/assets/textures/environmentMaps/0/ny.jpg";
import NZ from "./public/assets/textures/environmentMaps/0/nz.jpg";
import PX from "./public/assets/textures/environmentMaps/0/px.jpg";
import PY from "./public/assets/textures/environmentMaps/0/py.jpg";
import PZ from "./public/assets/textures/environmentMaps/0/pz.jpg";

import * as CANNON from "cannon-es";
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
const hitSound = new Audio("./public/assets/sounds/hit.mp3");

/**
 * 处理物体碰撞时的音效播放
 * @param {Object} collision - 碰撞事件对象
 */
const playHitSound = (collision) => {
  // 获取碰撞的冲击速度
  const impactVelocity = collision.contact.getImpactVelocityAlongNormal();
  // 当冲击速度大于阈值时播放音效
  if (impactVelocity > 1.5) {
    // 随机设置音量,增加真实感
    hitSound.volume = Math.random();
    // 重置音频播放位置
    hitSound.currentTime = 0;
    // 播放碰撞音效
    hitSound.play();
  }
};
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const debugObject = {};
debugObject.createSphere = () => {
  createSphereMesh(Math.random() * 1.5, {
    x: (Math.random() - 0.5) * 3,
    y: 3,
    z: (Math.random() - 0.5) * 3,
  });
};
debugObject.createBoxMesh = () => {
  createBoxMesh(Math.random() * 1.5, Math.random() * 1.5, Math.random() * 1.5, {
    x: (Math.random() - 0.5) * 3,
    y: 3,
    z: (Math.random() - 0.5) * 3,
  });
};
debugObject.reset = () => {
  for (const sphere of sphereMeshes) {
    sphere.body.removeEventListener("collide", playHitSound);
    world.removeBody(sphere.body);
    scene.remove(sphere.mesh);
  }
  sphereMeshes.splice(0, sphereMeshes.length);
};
gui.add(debugObject, "createSphere");
gui.add(debugObject, "createBoxMesh");
gui.add(debugObject, "reset");
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

/**
 * 物理世界 CANNON
 */

const world = new CANNON.World();
// 使用 SAPBroadphase 算法进行碰撞检测优化
world.broadphase = new CANNON.SAPBroadphase(world);
// 允许物体休眠以提高性能
world.allowSleep = true;
world.gravity.set(0, -9.82, 0);

const defaultMaterial = new CANNON.Material("default");
const defaultContactMaterial = new CANNON.ContactMaterial(
  defaultMaterial,
  defaultMaterial,
  {
    friction: 0.1,
    restitution: 0.7,
  }
);

world.addContactMaterial(defaultContactMaterial);
world.defaultContactMaterial = defaultContactMaterial;
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body({
  mass: 0, // 质量为0,使其成为静态物体
  shape: floorShape, // 设置碰撞形状为平面
  // material: constraint,
});

floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);
world.addBody(floorBody);
// 创建球体和物理实体集合
const sphereMeshes = [];
// 创建球体和物理实体
const sphereGeometry = new THREE.SphereGeometry(1, 20, 20);
const sphereMaterial = new THREE.MeshStandardMaterial({
  metalness: 0.3,
  roughness: 0.4,
  envMap: environmentMapTexture,
});
const createSphereMesh = (radius, position) => {
  // 创建球体
  const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphereMesh.scale.set(radius, radius, radius);
  sphereMesh.castShadow = true;
  sphereMesh.position.copy(position);
  scene.add(sphereMesh);
  const sphereShape = new CANNON.Sphere(radius);
  const sphereBody = new CANNON.Body({
    mass: 1,
    shape: sphereShape,
  });
  sphereBody.position.copy(position);
  world.addBody(sphereBody);
  sphereMeshes.push({ mesh: sphereMesh, body: sphereBody });
  return sphereMesh;
};
// 创建 box
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshStandardMaterial({
  metalness: 0.3,
  roughness: 0.4,
  envMap: environmentMapTexture,
});
function createBoxMesh(x, y, z, position) {
  const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
  boxMesh.castShadow = true;
  boxMesh.scale.set(x, y, z);
  boxMesh.position.copy(position);
  scene.add(boxMesh);
  const boxShape = new CANNON.Box(new CANNON.Vec3(x * 0.5, y * 0.5, z * 0.5));
  const boxBody = new CANNON.Body({
    mass: 1,
    shape: boxShape,
  });
  boxBody.position.copy(position);
  boxBody.addEventListener("collide", playHitSound);
  world.addBody(boxBody);
  sphereMeshes.push({ mesh: boxMesh, body: boxBody });
}
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
  for (const sphere of sphereMeshes) {
    // 将物理引擎中物体的位置同步到Three.js的网格中
    sphere.mesh.position.copy(sphere.body.position);
    // 将物理引擎中物体的旋转同步到Three.js的网格中
    sphere.mesh.quaternion.copy(sphere.body.quaternion);
  }
  world.step(1 / 60, deltaTime, 3);
  // 同步物理世界的球的运动

  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};
tick();
