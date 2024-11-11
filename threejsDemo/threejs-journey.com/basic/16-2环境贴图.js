import GUI from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";

// 获取canvas 元素
const canvas = document.querySelector("canvas.webgl");
// 定义窗口尺寸对象
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
// 创建场景
const scene = new THREE.Scene();
const gui = new GUI();
const global = {};
// 模型加载器
const loader = new GLTFLoader();
const rgbeLoader = new RGBELoader();
// 环境贴图加载器
const cubeTextureLoader = new THREE.CubeTextureLoader();
const geometry = new THREE.TorusKnotGeometry(0.3, 0.1, 64, 8);
const material = new THREE.MeshStandardMaterial({
  color: "#ffffff",
  // metalness（金属度） 取值范围：0 到1
  // metalness: 0.5 表示材质的金属感程度处于中等水平
  // 0 = 非金属材质（如塑料、木材）
  // 1 = 完全金属材质（如钢铁、金属）
  metalness: 1,
  //   roughness（粗糙度）
  // 取值范围：0 到 1
  // roughness: 0.5 表示材质的粗糙程度处于中等水平
  // 0 = 完全光滑（如镜面）
  // 1 = 完全粗糙（如砂纸）
  roughness: 0.5,
});
const mesh = new THREE.Mesh(geometry, material);
mesh.position.x = -1;
scene.add(mesh);
/**
 * 环境
 */
global.intensity = 1;
// LDR 环境贴图 需要六张图片
// const environmentMap = cubeTextureLoader.load([
//   "./public/assets/textures/environmentMaps/0/px.jpg",
//   "./public/assets/textures/environmentMaps/0/nx.jpg",
//   "./public/assets/textures/environmentMaps/0/py.jpg",
//   "./public/assets/textures/environmentMaps/0/ny.jpg",
//   "./public/assets/textures/environmentMaps/0/pz.jpg",
//   "./public/assets/textures/environmentMaps/0/nz.jpg",
// ]);
// scene.background = environmentMap; // 视觉效果：创建环境背景
// scene.environment = environmentMap; // 光照效果：提供环境反射

// hdr 环境贴图 需要一张图片可以提高
// rgbeLoader.load("./public/assets/textures/HDR/2.hdr", (environmentMap) => {
//   environmentMap.mapping = THREE.EquirectangularReflectionMapping;
//   scene.background = environmentMap;
//   scene.environment = environmentMap;
// });
// 环境贴图加载器 可以实现实时渲染
const textureLoader = new THREE.TextureLoader();
const environmentMap = textureLoader.load("./public/assets/textures/360/1.jpg");
environmentMap.mapping = THREE.EquirectangularReflectionMapping;
scene.background = environmentMap;
// real-time-render
const holyDonut = new THREE.Mesh(
  new THREE.TorusGeometry(2, 0.2),
  new THREE.MeshBasicMaterial({ color: new THREE.Color(10, 10, 10) })
);
// 设置层级
holyDonut.layers.enable(1);
holyDonut.position.y = 0.3;
holyDonut.position.x = -0.3;
scene.add(holyDonut);
// 立方相机
// 创建一个立方体渲染目标，用于实时环境反射
// 参数256表示立方体贴图的分辨率大小
// type: THREE.HalfFloatType 使用16位浮点数存储像素值，在保持较好图像质量的同时节省内存
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
  type: THREE.HalfFloatType,
});

// 将立方体渲染目标的纹理设置为场景的环境贴图
// 这样场景中的物体可以反射这个实时生成的环境贴图
scene.environment = cubeRenderTarget.texture;

// 创建立方体相机用于捕捉环境贴图
// 参数说明:
// - 0.1: 近裁剪面距离
// - 100: 远裁剪面距离
// - cubeRenderTarget: 渲染结果输出的目标对象
const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget);
// 设置层级 立方相机只渲染层级为1的物体
cubeCamera.layers.set(1);
scene.backgroundBlurriness = 0; // 环境背景模糊程度
scene.backgroundIntensity = 1; // 环境光照强度
gui
  .add(scene, "backgroundBlurriness")
  .min(0)
  .max(1)
  .step(0.001)
  .name("环境背景模糊程度");
gui
  .add(scene, "backgroundIntensity")
  .min(0)
  .max(10)
  .step(0.001)
  .name("环境光照强度");
gui
  .add(global, "intensity")
  .min(0)
  .max(10)
  .step(0.001)
  .name("环境贴图强度")
  .onFinishChange(allMaterialUpdate);
function allMaterialUpdate() {
  scene.traverse((child) => {
    // child instanceof THREE.Mesh &&child.material === THREE.MeshStandardMaterial; 判断mesh材质是否是MeshStandardMaterial
    // child.isMesh && child.material.isMeshStandardMaterial 判断
    if (
      child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshStandardMaterial
    ) {
      // 设置环境贴图
      // child.material.envMap = environmentMap; cubeTexture的时候需要
      child.material.envMapIntensity = global.intensity;
      child.material.needsUpdate = true;
    }
  });
}
/**
 * 加载模型
 */
loader.load(
  "./public/assets/models/FlightHelmet/glTF/FlightHelmet.gltf",
  (gltf) => {
    gltf.scene.scale.set(2, 2, 2);
    gltf.scene.position.y = -0.5;
    scene.add(gltf.scene);
    allMaterialUpdate();
  }
);
// 创建相机
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);

camera.position.z = 6;
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  renderer.setSize(sizes.width, sizes.height);
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
});
const clock = new THREE.Clock();
function tick() {
  const elapsedTime = clock.getElapsedTime();
  window.requestAnimationFrame(tick);
  if (holyDonut) {
    holyDonut.rotation.x = Math.sin(elapsedTime) * 2;
    cubeCamera.update(renderer, scene);
  }
  renderer.render(scene, camera);
  controls.update();
}
tick();
