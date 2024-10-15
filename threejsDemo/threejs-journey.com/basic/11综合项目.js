import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
const textureLoader = new THREE.TextureLoader();
const doorColorTexture = textureLoader.load(
  "./public/assets/textures/door/color.jpg"
);
const doorAlphaTexture = textureLoader.load(
  "./public/assets/textures/door/alpha.jpg"
);
const doorAmbientOcclusionTexture = textureLoader.load(
  "./public/assets/textures/door/ambientOcclusion.jpg"
);
const doorHeightTexture = textureLoader.load(
  "./public/assets/textures/door/height.jpg"
);
const doorNormalTexture = textureLoader.load(
  "./public/assets/textures/door/normal.jpg"
);
const doorMetalnessTexture = textureLoader.load(
  "./public/assets/textures/door/metalness.jpg"
);
const doorRoughnessTexture = textureLoader.load(
  "./public/assets/textures/door/roughness.jpg"
);
// 墙壁
const wallsColorTexture = textureLoader.load(
  "./public/assets/textures/bricks/color.jpg"
);
const wallsNormalTexture = textureLoader.load(
  "./public/assets/textures/bricks/normal.jpg"
);
const wallsAmbientOcclusionTexture = textureLoader.load(
  "./public/assets/textures/bricks/ambientOcclusion.jpg"
);
const wallsRoughnessTexture = textureLoader.load(
  "./public/assets/textures/bricks/roughness.jpg"
);
// 草地
const grassColorTexture = textureLoader.load(
  "./public/assets/textures/grass/color.jpg"
);
const grassNormalTexture = textureLoader.load(
  "./public/assets/textures/grass/normal.jpg"
);
const grassAmbientOcclusionTexture = textureLoader.load(
  "./public/assets/textures/grass/ambientOcclusion.jpg"
);
const grassRoughnessTexture = textureLoader.load(
  "./public/assets/textures/grass/roughness.jpg"
);
grassColorTexture.repeat.set(8, 8);
grassAmbientOcclusionTexture.repeat.set(8, 8);
grassNormalTexture.repeat.set(8, 8);
grassRoughnessTexture.repeat.set(8, 8);

grassColorTexture.wrapS = THREE.RepeatWrapping;
grassAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping;
grassNormalTexture.wrapS = THREE.RepeatWrapping;
grassRoughnessTexture.wrapS = THREE.RepeatWrapping;

grassColorTexture.wrapT = THREE.RepeatWrapping;
grassAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping;
grassNormalTexture.wrapT = THREE.RepeatWrapping;
grassRoughnessTexture.wrapT = THREE.RepeatWrapping;
const gui = new GUI();
const canvas = document.querySelector("canvas.webgl");
// 2. 场景
const scene = new THREE.Scene();
// 雾 边缘如果颜色割裂，可以改变renderer的颜色
scene.fog = new THREE.Fog("#262837", 1, 15);
// 添加地面平面
const planeGeometry = new THREE.PlaneGeometry(20, 20);
const planeMaterial = new THREE.MeshStandardMaterial({
  map: grassColorTexture,
  aoMap: grassAmbientOcclusionTexture,
  normalMap: grassNormalTexture,
  roughnessMap: grassRoughnessTexture,
});

const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.geometry.setAttribute(
  "uv2",
  new THREE.Float32BufferAttribute(planeMesh.geometry.attributes.uv.array, 2)
);
planeMesh.rotation.x = -Math.PI / 2;
planeMesh.receiveShadow = true;
scene.add(planeMesh);
// house
var house = new THREE.Group();
// 灯光
// 环境光
const ambientLight = new THREE.AmbientLight("#b9d5ff", 0.12);
scene.add(ambientLight);
// 平行光
const light = new THREE.DirectionalLight("#b9d5ff", 0.12);
light.position.set(4, 5, -2);
scene.add(light);
// doorLight
const doorLight = new THREE.PointLight("#ff7d46", 1, 7);
doorLight.position.set(0, 2.2, 2.7);
// distance 距离
// intensity 强度
const doorLightFolder = gui.addFolder("门灯");
doorLightFolder
  .add(doorLight, "intensity")
  .min(0)
  .max(10)
  .step(0.001)
  .name("门灯强度");
doorLightFolder
  .add(doorLight.position, "y")
  .min(0)
  .max(10)
  .step(0.001)
  .name("门灯y");
doorLightFolder
  .add(doorLight.position, "z")
  .min(0)
  .max(10)
  .step(0.001)
  .name("门灯z");
house.add(doorLight);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(3, 4, 5);

scene.add(house);

// Standard (n.)：标准，规范，基准。可以指某事物被普遍接受的尺度或典范，也可以指某种测量的统一基准。
// Standard 可以拆分为以下部分：
// Stand：表示“站立”，引申为“固定的、保持的”，有“稳定、坚持”的含义。
// -ard：这是一个常见的后缀，表示某种特征或性质，如 coward（胆小鬼），表示一种特性或行为。
// 墙壁
const walls = new THREE.Mesh(
  new THREE.BoxGeometry(4, 2.5, 4),
  new THREE.MeshStandardMaterial({
    color: "#ac8e82",
    map: wallsColorTexture,
    aoMap: wallsAmbientOcclusionTexture,
    normalMap: wallsNormalTexture,
    roughnessMap: wallsRoughnessTexture,
  })
);
walls.geometry.setAttribute(
  "uv2",
  new THREE.Float32BufferAttribute(walls.geometry.attributes.uv.array, 2)
);
walls.position.y = 1.25;
house.add(walls);
// 房顶
// ConeGeometry 圆锥
const roof = new THREE.Mesh(
  // radius — 圆锥底部的半径，默认值为1。
  // height — 圆锥的高度，默认值为1。
  // radialSegments — 圆锥侧面周围的分段数，默认为32。
  new THREE.ConeGeometry(3.5, 1, 4),
  new THREE.MeshStandardMaterial({ color: "#924b37" })
);
roof.position.y =
  walls.geometry.parameters.height + roof.geometry.parameters.height / 2;
roof.rotation.y = Math.PI * 0.25;
house.add(roof);
// door
const door = new THREE.Mesh(
  new THREE.PlaneGeometry(2.2, 2.2, 100, 100),
  new THREE.MeshStandardMaterial({
    map: doorColorTexture,
    alphaMap: doorAlphaTexture,
    transparent: true,
    aoMap: doorAmbientOcclusionTexture,
    displacementMap: doorHeightTexture,
    displacementScale: 0.01,
    normalMap: doorNormalTexture,
    metalnessMap: doorMetalnessTexture,
    roughnessMap: doorRoughnessTexture,
  })
);
door.geometry.setAttribute(
  "uv2",
  new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2)
);
door.position.z = 2 + 0.01;
door.position.y = 1;
house.add(door);
// 灌木丛 bush
const bushGeo = new THREE.SphereGeometry(1, 16, 16);
const bushMat = new THREE.MeshStandardMaterial({ color: "#608d3d" });
const bush1 = new THREE.Mesh(bushGeo, bushMat);
bush1.position.set(1.3, 0.3, 2.2);
bush1.scale.set(0.4, 0.4, 0.4);
const bush2 = new THREE.Mesh(bushGeo, bushMat);
bush2.position.set(1.8, 0.1, 2.1);
bush2.scale.set(0.2, 0.2, 0.2);
const bush3 = new THREE.Mesh(bushGeo, bushMat);
bush3.position.set(-1.3, 0.3, 2.2);
bush3.scale.set(0.35, 0.35, 0.35);
const bush4 = new THREE.Mesh(bushGeo, bushMat);
bush4.position.set(-1.45, 0.075, 2.5);
bush4.scale.set(0.15, 0.15, 0.15);
scene.add(bush1, bush2, bush3, bush4);
// graves 墓碑
const graves = new THREE.Group();
scene.add(graves);
const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2);
const graveMaterial = new THREE.MeshStandardMaterial({ color: "#4d504d" });
const graveGeometryHeight = graveGeometry.parameters.height;
for (let i = 0; i < 50; i++) {
  const grave = new THREE.Mesh(graveGeometry, graveMaterial);
  const angle = Math.random() * Math.PI * 2;
  const radius = 3.5 + Math.random() * 6;
  // 围绕房子一周进行随机排列
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  grave.position.set(x, graveGeometryHeight / 2 - 0.1, z);
  grave.rotation.y = (Math.random() - 0.5) * 0.4;
  grave.rotation.z = (Math.random() - 0.5) * 0.4;
  graves.add(grave);
  grave.castShadow = true;
}
/**
 * 幽灵
 */
const ghost1 = new THREE.PointLight("#ff00ff", 2, 3);
scene.add(ghost1);
const ghost2 = new THREE.PointLight("#00ffff", 2, 3);
scene.add(ghost2);
const ghost3 = new THREE.PointLight("#ffff00", 2, 3);
scene.add(ghost3);
// 阴影
// 灯光阴影
light.castShadow = true;
doorLight.castShadow = true;
ghost1.castShadow = true;
ghost2.castShadow = true;
ghost3.castShadow = true;
walls.castShadow = true;
bush1.castShadow = true;
bush2.castShadow = true;
bush3.castShadow = true;
bush4.castShadow = true;
planeMesh.receiveShadow = true;
// 优化阴影
doorLight.shadow.mapSize.width = 256;
doorLight.shadow.mapSize.height = 256;
doorLight.shadow.camera.far = 7;

ghost1.shadow.mapSize.width = 256;
ghost1.shadow.mapSize.height = 256;
ghost1.shadow.camera.far = 7;

ghost2.shadow.mapSize.width = 256;
ghost2.shadow.mapSize.height = 256;
ghost2.shadow.camera.far = 7;

ghost3.shadow.mapSize.width = 256;
ghost3.shadow.mapSize.height = 256;
ghost3.shadow.camera.far = 7;
// const axesHelper = new THREE.AxesHelper();
// scene.add(axesHelper);
// 4. 渲染器
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor("#262837");
// 渲染器支持阴影
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // 阻尼效果
const clock = new THREE.Clock();
function animate() {
  const elapsedTime = clock.getElapsedTime();
  const ghost1Angle = elapsedTime * 0.5;
  ghost1.position.x = Math.sin(ghost1Angle) * 4;
  ghost1.position.z = Math.cos(ghost1Angle) * 4;
  ghost1.position.y = Math.sin(elapsedTime * 3);

  const ghost2Angle = -elapsedTime * 0.32;
  ghost2.position.x = Math.sin(ghost2Angle) * 5;
  ghost2.position.z = Math.cos(ghost2Angle) * 5;
  ghost2.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5);

  const ghost3Angle = -elapsedTime * 0.18;
  ghost3.position.x =
    Math.sin(ghost3Angle) * 4 + (Math.sin(elapsedTime * 0.32) + 3);
  ghost3.position.z =
    Math.cos(ghost3Angle) * 4 + (Math.sin(elapsedTime * 0.32) + 3);
  ghost3.position.y = Math.sin(elapsedTime * 5) + Math.sin(elapsedTime * 2.5);
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
