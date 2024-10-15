import * as THREE from "three";
/**
 * 1. 场景 scene
 *    物体 object
 *    几何体 geometry
 *    材质 material
 *    网格 mesh
 * 2. 相机 camera
 * 3. 渲染器 renderer
 */
const canvas = document.querySelector("canvas.webgl");
// 1. 场景 scene
const scene = new THREE.Scene();
// 1.1 geometry
const geometry = new THREE.BoxGeometry(1, 1, 1);
// 1.2 material 材质
const material = new THREE.MeshBasicMaterial({ color: "red" });
// 1.3 mesh 网格
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
// 辅助坐标
const axesHelper = new THREE.AxesHelper();
scene.add(axesHelper);
const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};
// 2. 相机 camera
const camera = new THREE.PerspectiveCamera(
  45,
  size.width / size.height,
  0.1,
  1000
);
camera.position.z = 3;
camera.lookAt(mesh.position);
console.log(mesh.position.distanceTo(camera.position)); // 物体到相机的距离 默认为0
// scale、position、rotation 都是继承 Object3D
// 设置网格的位置
mesh.position.set(0, 0, 0);
// 设置网格的缩放
mesh.scale.set(0.5, 0.5, 0.5);
// mesh.scale.x = 1;
// 设置网格的旋转
// mesh.rotation.y = Math.PI * 0.25; // Math.PI 半圆 3.1415926
// 标准化位置向量
mesh.position.normalize(); // // 标准化后，这个长度会等于1，但各个分量（x, y, z）加起来通常不等于1。
// 3. 渲染器 renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(size.width, size.height);
const time = new THREE.Clock();
// 添加动画循环
const tick = () => {
  const elapsedTime = time.getElapsedTime(); // getElapsedTime() 是 THREE.Clock 的一个方法，它返回自时钟启动以来经过的秒数
  mesh.position.y = Math.sin(elapsedTime);
  mesh.position.x = Math.cos(elapsedTime);
  camera.lookAt(mesh.position); // 相机始终朝向物体
  window.requestAnimationFrame(tick);
  renderer.render(scene, camera);
};
tick();

window.addEventListener("resize", () => {
  size.width = window.innerWidth;
  size.height = window.innerHeight;
  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();
  renderer.setSize(size.width, size.height);
  renderer.render(scene, camera);
});
