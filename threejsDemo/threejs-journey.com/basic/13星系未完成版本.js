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
/**
 * galaxy 星系
 */
const parameters = {
  count: 100000,
  size: 0.01,
  sizeAttenuation: true,
};
gui
  .add(parameters, "count")
  .min(100)
  .max(1000000)
  .step(100)
  .onFinishChange(() => generateGalaxy());
gui
  .add(parameters, "size")
  .min(0.01)
  .max(0.1)
  .step(0.01)
  .onFinishChange(() => generateGalaxy());
gui.add(parameters, "sizeAttenuation").onChange(() => {
  generateGalaxy();
});
/**
 * 生成星系 属性元素 供后续删除
 */
let geometry = null,
  material = null,
  points = null;
const generateGalaxy = () => {
  if (points !== null) {
    // 释放几何体对象,防止内存泄漏
    geometry.dispose();
    // 释放材质对象,防止内存泄漏
    material.dispose();
    // 从场景中移除网格对象,清理场景
    scene.remove(points);
  }
  geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(parameters.count * 3);
  material = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: parameters.sizeAttenuation,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 3;
    positions[i3 + 1] = (Math.random() - 0.5) * 3;
    positions[i3 + 2] = (Math.random() - 0.5) * 3;
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  points = new THREE.Points(geometry, material);
  scene.add(points);
};
generateGalaxy();

const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.z = 15;
const renderer = new THREE.WebGLRenderer({ canvas });
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
function animate() {
  window.requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
