import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
const gui = new GUI();
const canvas = document.querySelector("canvas.webgl");
// 2. 场景
const scene = new THREE.Scene();
// 添加three内部阴影的步骤
// 1. renderer 开启阴影的渲染 renderer.shadowMap.enabled = true
// 2. 物体开启阴影的投射 mesh.castShadow = true
// 3. 物体开启阴影的接受 mesh.receiveShadow = true
// 4. 光源开启阴影的投射 light.castShadow = true
// 通过 material 贴图的方式添加阴影
// 添加地面平面
const planeGeometry = new THREE.PlaneGeometry(10, 10);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.rotation.x = -Math.PI / 2; // 旋转平面使其水平
planeMesh.position.y = -0.7; // 将平面下移，使其位于其他物体下方
// 阴影3 开启阴影的接收
planeMesh.receiveShadow = true;
// "receive" 的意思是“接收”或“收到”，通常指的是接受某种东西，如信息、礼物、信号等。
// re-: 这是一个前缀，意思是“再次”或“返回”。
// ceive: 这是一个词根，意思是“拿”或“取”。
scene.add(planeMesh);
// 环境光设置
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const ambientFolder = gui.addFolder("环境光");
ambientFolder
  .add(ambientLight, "intensity")
  .min(0)
  .max(1)
  .step(0.001)
  .name("强度");
ambientFolder.add(ambientLight, "visible").name("显示/隐藏");

// ======================平行光的阴影设置======================
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(2, 2, -1);
// 阴影4 开启灯光的阴影的投射
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024; // 一个Vector2定义阴影贴图的宽度和高度。
directionalLight.shadow.mapSize.height = 1024;
// 相机的视锥体宽度
directionalLight.shadow.camera.left = -2;
directionalLight.shadow.camera.right = 2;
directionalLight.shadow.camera.top = 2;
directionalLight.shadow.camera.bottom = -2;
// 相机的近裁面和远裁面
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 6;
// 阴影的模糊半径
directionalLight.shadow.radius = 10;
// directionalLight.shadow是THREE.LightShadow的实例，表示灯光的阴影 可以获取到阴影的相机
const directionalLightCameraHelper = new THREE.CameraHelper(
  directionalLight.shadow.camera
);
directionalLightCameraHelper.visible = false;
scene.add(directionalLightCameraHelper);
gui.add(directionalLightCameraHelper, "visible").name("阴影相机辅助");
gui
  .add(directionalLight, "intensity")
  .min(0)
  .max(1)
  .step(0.001)
  .name("平行光强度");
gui
  .add(directionalLight.position, "x")
  .min(-10)
  .max(10)
  .step(0.001)
  .name("平行光位置");
gui
  .add(directionalLight.position, "y")
  .min(-10)
  .max(10)
  .step(0.001)
  .name("平行光位置");
// scene.add(directionalLight);
// ======================平行光的阴影设置======================
// =====================聚光灯的设置======================
const spotLight = new THREE.SpotLight(0xffffcc, 0.5, 10, Math.PI * 0.2, 0.5, 1);
spotLight.position.set(0, 3, 2);

// 开启聚光灯阴影
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.camera.near = 1;
spotLight.shadow.camera.far = 6;

scene.add(spotLight);

const spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLightHelper);

// 创建聚光灯文件夹
const spotLightFolder = gui.addFolder("聚光灯");

// 添加聚光灯参数控制
spotLightFolder
  .add(spotLight, "intensity")
  .min(0)
  .max(1)
  .step(0.01)
  .name("强度");
spotLightFolder
  .add(spotLight, "distance")
  .min(0)
  .max(20)
  .step(0.1)
  .name("距离");
spotLightFolder
  .add(spotLight, "angle")
  .min(0)
  .max(Math.PI / 2)
  .step(0.01)
  .name("角度");
spotLightFolder
  .add(spotLight, "penumbra")
  .min(0)
  .max(1)
  .step(0.01)
  .name("半影");
spotLightFolder.add(spotLight, "decay").min(0).max(2).step(0.01).name("衰减");

// 添加聚光灯位置控制
const spotLightPositionFolder = spotLightFolder.addFolder("位置");
spotLightPositionFolder
  .add(spotLight.position, "x")
  .min(-10)
  .max(10)
  .step(0.1)
  .name("X");
spotLightPositionFolder
  .add(spotLight.position, "y")
  .min(-10)
  .max(10)
  .step(0.1)
  .name("Y");
spotLightPositionFolder
  .add(spotLight.position, "z")
  .min(-10)
  .max(10)
  .step(0.1)
  .name("Z");

// 添加聚光灯辅助可见性控制
spotLightFolder.add(spotLightHelper, "visible").name("显示辅助");

// 更新聚光灯辅助的函数
function updateSpotLightHelper() {
  spotLightHelper.update();
}

// 为所有可能影响聚光灯辅助的控件添加 onChange 事件
spotLightFolder.controllers.forEach((controller) => {
  controller.onChange(updateSpotLightHelper);
});
spotLightPositionFolder.controllers.forEach((controller) => {
  controller.onChange(updateSpotLightHelper);
});

// =====================聚光灯的设置======================
// 点光源设置
const pointLight = new THREE.PointLight(0xffffff, 1, 10, 2);
pointLight.position.set(0, 3, 2);
scene.add(pointLight);

const pointLightHelper = new THREE.PointLightHelper(pointLight);
scene.add(pointLightHelper);

const pointLightFolder = gui.addFolder("点光源");
pointLightFolder
  .add(pointLight, "intensity")
  .min(0)
  .max(1)
  .step(0.01)
  .name("强度");
pointLightFolder
  .add(pointLight.position, "x")
  .min(-10)
  .max(10)
  .step(0.1)
  .name("X位置");
pointLightFolder
  .add(pointLight.position, "y")
  .min(-10)
  .max(10)
  .step(0.1)
  .name("Y位置");
pointLightFolder
  .add(pointLight.position, "z")
  .min(-10)
  .max(10)
  .step(0.1)
  .name("Z位置");
pointLightFolder
  .add(pointLight, "visible")
  .name("显示/隐藏")
  .onChange(() => {
    pointLightHelper.visible = pointLight.visible;
  });
// 定义材质
const material = new THREE.MeshStandardMaterial({
  color: 0xffffff, // 设置一个默认颜色
  roughness: 0.5, // 设置粗糙度
  metalness: 0.1, // 设置金属度
});

// 1. 物体
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
// 阴影2 开启阴影的投射
// cast: 这个单词可以联想到“投掷”（throwing）或“铸造”（molding），因为它们都涉及到某种形式的“投”或“造”。
const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 16);
const torusGeometry = new THREE.TorusGeometry(0.25, 0.2);
const box = new THREE.Mesh(boxGeometry, material);
box.castShadow = true;
const sphereMesh = new THREE.Mesh(sphereGeometry, material);
const torusMesh = new THREE.Mesh(torusGeometry, material);
scene.add(box);
sphereMesh.position.x = 2;
scene.add(sphereMesh);
torusMesh.position.x = -2;
scene.add(torusMesh);
// 3. 相机
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 10;
const axesHelper = new THREE.AxesHelper();
scene.add(axesHelper);
// 4. 渲染器
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
// 阴影1 开启阴影 开启阴影的贴图
renderer.shadowMap.enabled = true;
const controls = new OrbitControls(camera, renderer.domElement);
function animate() {
  requestAnimationFrame(animate);

  // 更新光源辅助对象
  if (spotLightHelper) spotLightHelper.update();
  if (pointLightHelper) pointLightHelper.update();

  renderer.render(scene, camera);
}
animate();
