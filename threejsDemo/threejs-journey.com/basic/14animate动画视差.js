import gsap from "gsap";
import * as dat from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
/**
 * basic setup
 */
const canvas = document.querySelector("canvas.webgl");
const gui = new dat.GUI();
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const scene = new THREE.Scene();
const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load(
  "./public/assets/textures/gradients/3.jpg"
);
const parameters = {
  materialColor: "#ffeded",
};
gui.addColor(parameters, "materialColor").onChange(() => {
  material.color.set(parameters.materialColor);
});
// 设置纹理的放大滤镜为最近点采样
// magFilter 用于纹理放大时的过滤方式
// NearestFilter 表示使用最近点采样,不会对纹理进行平滑处理
// 这样可以保持纹理的像素化效果,适合卡通渲染等风格
gradientTexture.magFilter = THREE.NearestFilter;
/**
 * 灯光 平行光
 */
const directionalLight = new THREE.DirectionalLight("#ffffff", 1);
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight);
const material = new THREE.MeshToonMaterial({
  color: parameters.materialColor,
  gradientMap: gradientTexture,
});
// 对象
const mesh1 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 60), material);
const mesh2 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), material);
const mesh3 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
  material
);
const objectsDistance = 6; // 对象间距
mesh1.position.x = 2;
mesh2.position.x = -2;
mesh3.position.x = 2;
mesh1.position.y = -objectsDistance * 0;
mesh2.position.y = -objectsDistance * 1;
mesh3.position.y = -objectsDistance * 2;
// 创建一个数组存储所有的网格对象,方便统一管理
const sectionMeshes = [mesh1, mesh2, mesh3];
scene.add(mesh1, mesh2, mesh3);
/**
 * 粒子 particles
 */
const particlesCount = 200;
const positions = new Float32Array(particlesCount * 3);
const particlesGeometry = new THREE.BufferGeometry();
// 创建粒子的位置数据
for (let i = 0; i < particlesCount; i++) {
  // X轴位置: 在-5到5之间随机分布
  positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
  // Y轴位置: 基于对象间距和网格数量计算
  // objectsDistance * 0.5 是整体向上偏移量
  // Math.random() * objectsDistance * sectionMeshes.length 是在所有网格对象的高度范围内随机分布
  positions[i * 3 + 1] =
    objectsDistance * 0.5 -
    Math.random() * objectsDistance * sectionMeshes.length;

  // Z轴位置: 在-5到5之间随机分布
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
}
particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);
const particlesMaterial = new THREE.PointsMaterial({
  color: parameters.materialColor,
  size: 0.02,
  sizeAttenuation: true,
});
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);
// 创建相机
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  1000
);
cameraGroup.add(camera);

camera.position.z = 12;
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // 阻尼效果
// 监听滚动事件
let scrollY = window.scrollY;
// 鼠标位置
const mouse = {
  x: 0,
  y: 0,
};
// 当前处于第几个模型
let currentSection = 0;
// 监听鼠标移动事件
window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX / sizes.width - 0.5;
  mouse.y = e.clientY / sizes.height - 0.5;
});
window.addEventListener("scroll", (e) => {
  scrollY = window.scrollY;
  const newSection = Math.round(scrollY / sizes.height);
  if (newSection != currentSection) {
    currentSection = newSection;
    gsap.to(sectionMeshes[currentSection].rotation, {
      duration: 1.5,
      ease: "power2.inOut",
      x: "+=6",
      y: "+=3",
      z: "+=1.5",
    });
  }
});
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  renderer.setSize(sizes.width, sizes.height);
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
});
const clock = new THREE.Clock();
// 记录上一次的时间
let previousTime = 0;
const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;
  // 相机动画
  // 根据滚动位置更新相机的Y轴位置
  // scrollY: 当前页面滚动的距离(像素)
  // sizes.height: 视口高度
  // objectsDistance: 对象之间的间距(6)
  // 除以视口高度将滚动距离标准化为0-1之间的值
  // 乘以对象间距将标准化的值映射到实际的3D空间距离
  // 负号是因为需要向下滚动时相机向上移动
  camera.position.y = (-scrollY / sizes.height) * objectsDistance;
  // 计算视差效果的目标偏移量
  // 将鼠标位置乘以0.5来减缓效果
  const parallaxX = mouse.x * 0.5;
  const parallaxY = -mouse.y * 0.5;
  // 使用线性插值(LERP)平滑过渡相机组的位置
  // (target - current) * speed * deltaTime 是标准LERP公式
  // deltaTime确保动画速度与帧率无关
  // 系数5控制过渡速度
  cameraGroup.position.x +=
    (parallaxX - cameraGroup.position.x) * 5 * deltaTime;
  cameraGroup.position.y +=
    (parallaxY - cameraGroup.position.y) * 5 * deltaTime;
  // 动画
  for (const mesh of sectionMeshes) {
    mesh.rotation.x += deltaTime * 0.12;
    mesh.rotation.y += deltaTime * 0.14;
  }
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};
tick();
