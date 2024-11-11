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
const textureLoader = new THREE.TextureLoader();
/**
 * 环境
 */
global.intensity = 1;
// LDR
// const environmentMap = textureLoader.load("./public/assets/textures/360/2.jpg");
// environmentMap.mapping = THREE.EquirectangularReflectionMapping;
// scene.background = environmentMap;

// hdr 环境贴图 需要一张图片可以提高
rgbeLoader.load("./public/assets/textures/HDR/2.hdr", (environmentMap) => {
  environmentMap.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = environmentMap;
  scene.environment = environmentMap;
});
// 加载模型
loader.load(
  "./public/assets/models/FlightHelmet/glTF/FlightHelmet.gltf",
  (gltf) => {
    gltf.scene.scale.set(10, 10, 10);
    gltf.scene.position.y = -5;
    scene.add(gltf.scene);
    allMaterialUpdate();
  }
);
// floor & wall
const floorMaterialTexture = textureLoader.load(
  "./public/assets/textures/floor/wood_floor_1k/textures/wood_floor_diff_1k.png"
);
const floorMaterialTextureNormal = textureLoader.load(
  "./public/assets/textures/floor/wood_floor_1k/textures/wood_floor_nor_gl_1k.png"
);
const floorMaterialTextureAo = textureLoader.load(
  "./public/assets/textures/floor/wood_floor_1k/textures/wood_floor_arm_1k.png"
);
floorMaterialTexture.colorSpace = THREE.SRGBColorSpace;
const floorMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(8, 8),
  new THREE.MeshStandardMaterial({
    map: floorMaterialTexture,
    normalMap: floorMaterialTextureNormal,
    aoMap: floorMaterialTextureAo,
    roughnessMap: floorMaterialTextureAo,
    metalnessMap: floorMaterialTextureAo,
  })
);
floorMesh.rotation.x = -Math.PI / 2;
floorMesh.position.y = -5;
scene.add(floorMesh);
const wallMaterialTexture = textureLoader.load(
  "./public/assets/textures/floor/worn_brick_floor_1k/textures/worn_brick_floor_diff_1k.jpg"
);
const wallMaterialTextureNormal = textureLoader.load(
  "./public/assets/textures/floor/worn_brick_floor_1k/textures/worn_brick_floor_nor_gl_1k.png"
);
const wallMaterialTextureAo = textureLoader.load(
  "./public/assets/textures/floor/worn_brick_floor_1k/textures/worn_brick_floor_arm_1k.jpg"
);
wallMaterialTexture.colorSpace = THREE.SRGBColorSpace;
const wallMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(8, 8),
  new THREE.MeshStandardMaterial({
    map: wallMaterialTexture,
    normalMap: wallMaterialTextureNormal,
    aoMap: wallMaterialTextureAo,
    roughnessMap: wallMaterialTextureAo,
    metalnessMap: wallMaterialTextureAo,
  })
);
wallMesh.position.y = -1;
wallMesh.position.z = -4;
scene.add(wallMesh);
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
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}
// 创建相机
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);

camera.position.z = 20;
scene.add(camera);
// 抗锯齿
/**
 * 锯齿(Aliasing)产生的原因:
 * 1. 当渲染3D场景时,像素网格的离散采样导致边缘呈现锯齿状
 * 2. 当物体的几何边缘不能完全对齐像素网格时特别明显
 *
 * 抗锯齿的主要方法:
 *
 * 1. MSAA(MultiSample Anti-Aliasing) - WebGL默认支持
 * - 优点:质量较好,性能消耗适中
 * - 缺点:只能处理几何边缘,不能处理材质内部的锯齿
 * - 启用方法:创建renderer时设置antialias:true
 *
 * 2. FXAA(Fast Approximate Anti-Aliasing)
 * - 优点:性能消耗低,可以处理所有类型的锯齿
 * - 缺点:会轻微模糊图像
 * - 启用方法:使用FXAAShader后期处理
 *
 * 3. SMAA(Subpixel Morphological Anti-Aliasing)
 * - 优点:质量最好,可以保持图像清晰度
 * - 缺点:性能消耗相对较高
 * - 启用方法:使用SMAAPass后期处理
 *
 * 4. TAA(Temporal Anti-Aliasing)
 * - 优点:质量非常好,特别适合动态场景
 * - 缺点:可能产生重影,需要运动矢量
 * - 启用方法:使用TAARenderPass
 *
 * 5. 提高像素密度
 * - 优点:最直接的方法,效果最好
 * - 缺点:性能消耗非常大
 * - 实现方法:增加renderer的像素比(setPixelRatio)
 */

// 本示例使用MSAA方式(见下方renderer配置)

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
// 设置像素比来提高渲染质量
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.render(scene, camera);
// 启用阴影渲染
renderer.shadowMap.enabled = true;
// 设置阴影类型为PCF柔和阴影
// PCFSoftShadowMap提供更柔和的阴影边缘
// 相比基础阴影贴图有以下优势:
// 1. 边缘更平滑,没有锯齿感
// 2. 阴影过渡更自然
// 3. 视觉效果更真实
// 但计算开销也更大
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
/**
 * 获取更加真实的渲染
 */
// 添加灯光

/**
 * 创建平行光
 *
 * @param {string} color - 灯光颜色
 * @param {number} intensity - 灯光强度
 * @returns {THREE.DirectionalLight} 创建的平行光对象
 */
function createDirectionalLight(color, intensity) {
  const light = new THREE.DirectionalLight(color, intensity);
  light.castShadow = true;
  light.shadow.camera.far = 20;
  // shadow acne 阴影痤疮
  // 方案1：设置阴影偏移值
  // light.shadow.bias = -0.004; // 减少阴影痤疮
  // light.shadow.normalBias = 0.004; // 更适合处理平面
  // 方案2：增加阴影贴图分辨率
  // light.shadow.mapSize.set(2048, 2048); // 提高精度
  // 方案3：调整光源位置
  // 避免光线与表面平行
  /**
   * 设置灯光目标的位置
   *
   * 灯光目标(light.target)表示灯光所指向的目标点的位置坐标(x, y, z)。
   * 它与灯光位置(light.position)共同决定了光线的方向。
   * 光线从灯光位置出发,指向灯光目标。
   * 改变灯光目标会改变光线的方向,但不影响灯光的位置。
   *
   * @param {number} x - 目标点的 x 坐标
   * @param {number} y - 目标点的 y 坐标
   * @param {number} z - 目标点的 z 坐标
   */
  function setLightTarget(x, y, z) {
    light.target.position.set(x, y, z);
    // 在改变灯光目标后,需要调用 updateMatrixWorld 来更新目标的世界矩阵
    light.target.updateMatrixWorld();
  }

  /**
   * 设置灯光位置
   *
   * 灯光位置(light.position)表示灯光在3D场景中的位置坐标(x, y, z)。
   * 它决定了灯光的起始点,即光线发出的位置。
   * 改变灯光位置会影响光线的方向和照射范围。
   *
   * @param {number} x - 灯光的 x 坐标
   * @param {number} y - 灯光的 y 坐标
   * @param {number} z - 灯光的 z 坐标
   */
  function setLightPosition(x, y, z) {
    light.position.set(x, y, z);
  }

  // 设置初始的灯光位置和目标
  setLightPosition(4.3, 3, 6);
  setLightTarget(0, -4, 0);

  return light;
}

// 添加灯光到场景
const directionalLight = createDirectionalLight("#ffffff", 3);
scene.add(directionalLight);
function createDirectionialLightHelper() {
  const directionalLightHelper = new THREE.DirectionalLightHelper(
    directionalLight,
    1
  );
  scene.add(directionalLightHelper);
  // 设置阴影贴图的分辨率大小
  // mapSize 决定了阴影的精细程度,值越大阴影越清晰,但也会消耗更多性能
  // 这里设置为 1024x1024 像素,在性能和质量之间取得平衡
  directionalLight.shadow.mapSize.set(1024, 1024);
  const lightGui = gui.addFolder("灯光辅助器");
  lightGui.close();
  // 先隐藏灯光辅助器
  directionalLightHelper.visible = false;
  lightGui.add(directionalLightHelper, "visible").name("开启灯光辅助器");
  const directionalLightShadowCamera = new THREE.CameraHelper(
    directionalLight.shadow.camera
  );
  // 先隐藏阴影相机
  directionalLightShadowCamera.visible = false;
  lightGui.add(directionalLightShadowCamera, "visible").name("阴影相机");
  scene.add(directionalLightShadowCamera);
  // 通过GUI控制灯光目标和位置
  lightGui
    .add(directionalLight.target.position, "x")
    .min(-10)
    .max(10)
    .step(0.001)
    .name("灯光目标x")
    .onChange(() => {
      directionalLight.target.updateMatrixWorld();
    });

  lightGui
    .add(directionalLight.target.position, "y")
    .min(-10)
    .max(10)
    .step(0.001)
    .name("灯光目标y")
    .onChange(() => {
      directionalLight.target.updateMatrixWorld();
    });
  lightGui
    .add(directionalLight.target.position, "z")
    .min(-10)
    .max(10)
    .step(0.001)
    .name("灯光目标z")
    .onChange(() => {
      directionalLight.target.updateMatrixWorld();
    });

  lightGui
    .add(directionalLight, "intensity")
    .min(0)
    .max(10)
    .step(0.001)
    .name("灯光强度");
  lightGui
    .add(directionalLight.position, "x")
    .min(-10)
    .max(10)
    .step(0.001)
    .name("灯光位置x");
  lightGui
    .add(directionalLight.position, "y")
    .min(-10)
    .max(10)
    .step(0.001)
    .name("灯光位置y");
  lightGui
    .add(directionalLight.position, "z")
    .min(-10)
    .max(10)
    .step(0.001)
    .name("灯光位置z");
}
createDirectionialLightHelper();
// 色调映射; 这个属性用于在普通计算机显示器或者移动设备屏幕等低动态范围介质上，模拟、逼近高动态范围（HDR）效果。
renderer.toneMapping = THREE.Reinhard;
gui
  .add(renderer, "toneMapping", {
    // 不进行色调映射,保持原始HDR值
    NO: THREE.NoToneMapping,
    // 线性映射,简单地将HDR值线性压缩到LDR范围
    // 例如:明亮的太阳会显得过于明亮,暗处细节丢失
    Linear: THREE.LinearToneMapping,
    // Reinhard色调映射,在保持整体对比度的同时压缩高光
    // 例如:适合室内场景,可以看到窗外的景色同时室内细节清晰
    Reinhard: THREE.ReinhardToneMapping,
    // 电影胶片映射,模拟电影胶片的响应曲线
    // 例如:给场景添加电影感,高光柔和过渡
    Cineon: THREE.CineonToneMapping,
    // ACES电影工业标准映射,提供最真实的视觉效果
    // 例如:适合任何照明条件,既保留明亮处细节又不会使暗处太黑
    ACESFilmic: THREE.ACESFilmicToneMapping,
    // AGX电影级色调映射,提供更好的色彩还原
    // 例如:对于高端视觉效果和电影级渲染很有用
    Agx: THREE.AgxToneMapping,
    // 自定义色调映射,允许开发者定义自己的映射函数
    // 例如:可以根据具体需求自定义映射曲线
    Custom: THREE.CustomToneMapping,
  })
  .name("色调映射");
// 曝光度 - 控制场景的整体亮度
// 取值范围: 0 到 10
// 0 = 完全黑暗
// 1 = 正常曝光
// >1 = 增加亮度
// 例如:
// - 0.5: 场景偏暗,适合夜景
// - 1.0: 标准日光场景
// - 2.0: 明亮的室外场景
// - 5.0: 非常明亮,如正午阳光
renderer.toneMappingExposure = 1;
gui
  .add(renderer, "toneMappingExposure")
  .min(0)
  .max(10)
  .step(0.001)
  .name("曝光度");

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
  renderer.render(scene, camera);
  controls.update();
}
tick();
