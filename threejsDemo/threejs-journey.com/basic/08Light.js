import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RectAreaLightHelper } from "three/addons/helpers/RectAreaLightHelper.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
const gui = new GUI();
const canvas = document.querySelector("canvas.webgl");
// 2. 场景
const scene = new THREE.Scene();
// 添加地面平面
const planeGeometry = new THREE.PlaneGeometry(10, 10);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.rotation.x = -Math.PI / 2; // 旋转平面使其水平
planeMesh.position.y = -2; // 将平面下移，使其位于其他物体下方
scene.add(planeMesh);

// 灯光消耗资源排行
// 0 AmbientLight 环境光  HemisphereLight 半球光
// 1 DirectionalLight 平行光 PointLight 点光源 SpotLight 聚光灯 这些也是有阴影的
// 2 RectAreaLight 矩形光源
// 在开发过程中，尽量使用性能消耗较低的光源（如环境光和半球光）来设置基础光照。
// 对于需要特定光照效果的区域，再添加性能消耗较高的光源（如点光源或聚光灯）。
// 使用光照贴图（Light Mapping）技术可以预先计算光照效果，减少实时渲染的性能消耗。
// 标准的材质，没有灯光，显示不出来

const material = new THREE.MeshStandardMaterial();
// 1. 物体
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 16);
const torusGeometry = new THREE.TorusGeometry(0.25, 0.2);
const box = new THREE.Mesh(boxGeometry, material);
const sphereMesh = new THREE.Mesh(sphereGeometry, material);
const torusMesh = new THREE.Mesh(torusGeometry, material);
scene.add(box);
sphereMesh.position.x = 2;
scene.add(sphereMesh);
torusMesh.position.x = -2;
scene.add(torusMesh);
// -----------------------------light灯光-----------------------------------
// ambientLight环境光，没有方向，所有的物体都被均匀的照亮 和基本材质类似,没有阴影
// 将“ambient”分解为：
// “ambi”（周围）
// “ent”（形容词后缀）
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const ambientFolder = gui.addFolder("环境光");
ambientFolder
  .add(ambientLight, "intensity")
  .min(0)
  .max(1)
  .step(0.001)
  .name("环境光强度");
// directionalLight 平行光，类似日光，有明确的方向 二维平面发光
// 将“directional”分解为：
// “direct”（直接的）
// “-ion”（名词后缀，表示状态或过程）
// “-al”（形容词后缀）
const directionalLight = new THREE.DirectionalLight(0xfffffc, 0.5);
scene.add(directionalLight);
const directionalFolder = gui.addFolder("平行光");
directionalFolder
  .add(directionalLight, "intensity")
  .min(0)
  .max(1)
  .step(0.001)
  .name("平行光强度");
// 半球光，天空到地面的光，没有阴影 （天空的颜色，地面的颜色，光的强度）
// 将“hemisphere”分解为：
// “hemi”（半球）
// “-sphere”（球体）
const hemisphereLight = new THREE.HemisphereLight("blue", "green", 0.9);
scene.add(hemisphereLight);
// pointLight 点光源，从一个点向四周发散的光，有阴影， 参数有：颜色，强度，距离，衰减系数
const pointLight = new THREE.PointLight(0xff4000, 0.7, 0, 2);
scene.add(pointLight);
// rectAreaLight 矩形光源，有阴影，参数有：颜色，强度，宽度，高度
// 只支持 MeshStandardMaterial 和 MeshPhysicalMaterial 两种材质。
const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 2, 1, 1);
rectAreaLight.position.set(0, 0, 2); // 默认是贴合正前方 所以需要改变下位置
rectAreaLight.lookAt(new THREE.Vector3());
scene.add(rectAreaLight);
const rectAreaFolder = gui.addFolder("矩形光源");
rectAreaFolder
  .add(rectAreaLight.position, "z")
  .min(-10)
  .max(10)
  .step(0.001)
  .name("矩形z光源位置");
rectAreaFolder
  .add(rectAreaLight.position, "y")
  .min(-10)
  .max(10)
  .step(0.001)
  .name("矩形y光源位置");
rectAreaFolder
  .add(rectAreaLight.position, "x")
  .min(-10)
  .max(10)
  .step(0.001)
  .name("矩形x光源位置");
rectAreaFolder
  .add(rectAreaLight, "intensity")
  .min(0)
  .max(10)
  .step(0.001)
  .name("矩形光源强度");
rectAreaFolder
  .add(rectAreaLight, "width")
  .min(1)
  .max(10)
  .step(0.001)
  .name("矩形光源宽度");
rectAreaFolder
  .add(rectAreaLight, "height")
  .min(1)
  .max(10)
  .step(0.001)
  .name("矩形光源高度");
const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight);
scene.add(rectAreaLightHelper);
// spotLight 聚光灯，有阴影，参数有：颜色，强度，光照的最大距离，角度，衰减的百分百，衰减量
const spotLight = new THREE.SpotLight(0x78ff00, 4.5, 7, Math.PI * 0.1, 0.25, 1);
spotLight.position.set(0, 2, 3); // 只是改变聚光灯的位置，但是光照对物体的位置不变还是中心点
scene.add(spotLight);
spotLight.target.position.x = -2; // 改变聚光的的目标
scene.add(spotLight.target); // 需要添加目标到场景中
const spotFolder = gui.addFolder("聚光灯");
spotFolder
  .add(spotLight, "intensity")
  .min(0)
  .max(10)
  .step(0.001)
  .name("聚光灯强度");
spotFolder
  .add(spotLight, "angle")
  .min(0)
  .max(Math.PI)
  .step(0.001)
  .name("聚光灯角度");
spotFolder
  .add(spotLight, "penumbra")
  .min(0)
  .max(1)
  .step(0.001)
  .name("聚光灯衰减");
spotFolder
  .add(spotLight, "decay")
  .min(0)
  .max(2)
  .step(0.001)
  .name("聚光灯衰减量");
spotFolder
  .add(spotLight.target.position, "x")
  .min(-10)
  .max(10)
  .step(0.001)
  .name("聚光目标位置");
const spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLightHelper);
// 3. 相机
const camera = new THREE.PerspectiveCamera(
  35,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 15;
const axesHelper = new THREE.AxesHelper();
scene.add(axesHelper);
// 4. 渲染器
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new OrbitControls(camera, renderer.domElement);
function animate() {
  requestAnimationFrame(animate);
  spotLightHelper.update();
  renderer.render(scene, camera);
}
animate();
