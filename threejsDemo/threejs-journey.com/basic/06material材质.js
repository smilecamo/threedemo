import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
const gui = new GUI();
const canvas = document.querySelector("canvas.webgl");
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load("/public/assets/textures/door/color.jpg");
const depthTexture = textureLoader.load(
  "/public/assets/textures/door/height.jpg"
);
const normalTexture = textureLoader.load(
  "/public/assets/textures/door/normal.jpg"
);

// 1. 场景
const scene = new THREE.Scene();
// 2. 物体
const geometry = new THREE.BoxGeometry(1, 1, 1); // 立方体
// 球体
const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 16);
const planeGeometry = new THREE.PlaneGeometry(1, 1); // 平面

// -------------------------- material 材质 --------------------------
// 基础材质 不受光照的影响 MeshBasicMaterial可以放入颜色color，贴图map，wireframe:线框，透明
// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const material = new THREE.MeshBasicMaterial({
  name: "material-1",
  map: texture,
  wireframe: false,
  transparent: true,
  opacity: 0.5,
});
// depthMaterial 深度材质 只受相机距离物体的距离影响，越近越亮，不受光照影响
const depthMaterial = new THREE.MeshDepthMaterial({
  map: depthTexture,
});
// 法线网格材质 MeshNormalMaterial 可以查看物体表面的法线
// flatShading 设置为 true，表示使用平面着色。这会使物体的面看起来更加分明，而不是平滑过渡。
const normalMaterial = new THREE.MeshNormalMaterial({
  normalMap: normalTexture,
  flatShading: true,
});
// standardMaterial 标准材质 受到光照的影响
const standardMaterial = new THREE.MeshStandardMaterial({
  color: 0x808080, // 设置基础颜色
  roughness: 0.5, // 设置粗糙度
  metalness: 0.5, // 设置金属度
  map: texture, // 使用之前加载的颜色贴图
  normalMap: normalTexture, // 使用法线贴图
});
gui
  .add(standardMaterial, "roughness")
  .min(0)
  .max(1)
  .step(0.001)
  .name("roughness");
gui
  .add(standardMaterial, "metalness")
  .min(0)
  .max(1)
  .step(0.001)
  .name("metalness");
// physicalMaterial  Three.js中最复杂和最逼真的材质之一 ，它是MeshStandardMaterial的扩展，提供了更多的参数来创建高度逼真的表面。
const physicalMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x808080,
  roughness: 0.5,
  metalness: 0.5,
  roughness: 0.1, // 低粗糙度
  clearcoat: 0.5, // 清漆层强度
  clearcoatRoughness: 0.1, // 清漆层粗糙度
  reflectivity: 1, // 反射率
  transmission: 0.5, // 透射率
  thickness: 0.5, // 厚度（用于折射）
  sheen: 1, // 光泽度
  sheenColor: 0x00ffff, // 光泽颜色
  sheenRoughness: 0.1, // 光泽粗糙度
  map: texture,
  normalMap: normalTexture,
});
// 为GUI添加控制
const physicalFolder = gui.addFolder("物理材质");
physicalFolder.add(physicalMaterial, "metalness", 0, 1, 0.01).name("金属度");
physicalFolder.add(physicalMaterial, "roughness", 0, 1, 0.01).name("粗糙度");
physicalFolder
  .add(physicalMaterial, "clearcoat", 0, 1, 0.01)
  .name("清漆层强度");
physicalFolder
  .add(physicalMaterial, "clearcoatRoughness", 0, 1, 0.01)
  .name("清漆层粗糙度");
physicalFolder.add(physicalMaterial, "transmission", 0, 1, 0.01).name("透射率");
physicalFolder.add(physicalMaterial, "thickness", 0, 5, 0.1).name("厚度");
physicalFolder.add(physicalMaterial, "sheen", 0, 1, 0.01).name("光泽度");
// MeshMatcapMaterial 材质捕捉材质 渲染通常需要几何体、光源、材质、shader 的共同参与。而matcap 是将光源、材质信息在3D建模软件中直接烘焙到一张纹理贴图上，渲染时直接拿来用即可，计算量自然大大减少，性能提升明显。我们还可以很方便的在不同的 matcap 纹理之间切换，看上去就和切换材质一样。
// 添加环境光和平行光以便更好地观察材质效果
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);
gui.add(normalMaterial, "flatShading").name("flatShading");
const mesh = new THREE.Mesh(geometry, physicalMaterial);
mesh.position.x = -1.5;
scene.add(mesh);
const mesh2 = new THREE.Mesh(sphereGeometry, physicalMaterial);
scene.add(mesh2);
const mesh3 = new THREE.Mesh(planeGeometry, physicalMaterial);
mesh3.position.x = 1.5;
scene.add(mesh3);
// 顶点法线辅助器
// const helper = new VertexNormalsHelper(mesh2, 0.1, 0xff0000);
// helper.name = "VertexNormalHelper";
// scene.add(helper);
// 3. 相机
const camera = new THREE.PerspectiveCamera(
  35,
  window.innerWidth / window.innerHeight,
  1,
  1000
);
camera.position.z = 16;

// 4. 渲染器
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new OrbitControls(camera, renderer.domElement);
function animate() {
  requestAnimationFrame(animate);
  // mesh.rotation.y += 0.01;
  // mesh2.rotation.y += 0.01;
  // mesh3.rotation.y += 0.01;

  renderer.render(scene, camera);
}
animate();
