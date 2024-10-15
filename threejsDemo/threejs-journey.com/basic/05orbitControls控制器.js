import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const canvas = document.querySelector("canvas.webgl");
// 1. 场景 scene
const scene = new THREE.Scene();
// 1.1 geometry
// 創建一個新的緩衝幾何體
const geometry = new THREE.BufferGeometry();

// 設置要創建的三角形數量
const count = 5;

// 創建一個浮點數數組來存儲頂點位置
// count * 3 * 3 解釋:
// - count: 三角形數量
// - 第一個3: 每個三角形有3個頂點
// - 第二個3: 每個頂點有x, y, z三個坐標
const positionsArray = new Float32Array(count * 3 * 3);

// 用隨機值填充數組
for (let i = 0; i < count * 3 * 3; i++) {
  // Math.random() 生成 0 到 1 之間的隨機數
  // (Math.random() - 0.5) 生成 -0.5 到 0.5 之間的隨機數
  // (Math.random() - 0.5) * 2 生成 -1 到 1 之間的隨機數
  positionsArray[i] = (Math.random() - 0.5) * 2;
}

// 創建一個 BufferAttribute 來描述頂點位置
// 參數 3 表示每個頂點由3個值(x, y, z)組成
const positionsAttribute = new THREE.BufferAttribute(positionsArray, 3);

// 將位置屬性添加到幾何體
geometry.setAttribute("position", positionsAttribute);
// 1.2 material 材质
const material = new THREE.MeshBasicMaterial({ color: "red", wireframe: true });
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
mesh.position.normalize(); // // 标准化后，这个长度会等于1，但各个分量（x, y, z）加起来通常不等于1。
// 3. 渲染器 renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(size.width, size.height);
// 添加动画循环
const controls = new OrbitControls(camera, canvas);
renderer.render(scene, camera);
const animate = () => {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
};
animate();

// 监听窗口大小变化
window.addEventListener("resize", () => {
  size.width = window.innerWidth;
  size.height = window.innerHeight;
  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();
  renderer.setSize(size.width, size.height);
  // 更新控制器
  renderer.render(scene, camera);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
// 全屏
document.addEventListener("dblclick", () => {
  const fullscreenElement =
    document.fullscreenElement || document.webkitFullscreenElement;

  if (!fullscreenElement) {
    // 进入全屏
    if (canvas.requestFullscreen) {
      canvas.requestFullscreen();
    } else if (canvas.webkitRequestFullscreen) {
      canvas.webkitRequestFullscreen();
    }
  } else {
    // 退出全屏
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
});
