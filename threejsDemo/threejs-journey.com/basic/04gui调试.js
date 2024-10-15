import GUI from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const canvas = document.querySelector("canvas.webgl");
// 1. 场景 scene
const scene = new THREE.Scene();
// 1.1 geometry

const geometry = new THREE.BufferGeometry();
const count = 5;
const positionsArray = new Float32Array(count * 3 * 3);
for (let i = 0; i < count * 3 * 3; i++) {
  positionsArray[i] = (Math.random() - 0.5) * 2;
}
const positionsAttribute = new THREE.BufferAttribute(positionsArray, 3);
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
// -------------------------------GUI
// gui的一些配置
const gui = new GUI({
  width: 300,
  title: "debug ui",
  closeFolders: true,
});
// 隐藏gui
// gui.hide();
window.addEventListener("keydown", (event) => {
  if (event.key === "h") {
    gui.show(gui._hidden);
  }
});
const cameraFolder = gui.addFolder("相机");
cameraFolder.add(camera.position, "z").min(1).max(9).step(0.01).name("z轴");
cameraFolder.add(camera.position, "y").min(-2).max(2).step(0.01).name("y轴");
const meshFolder = gui.addFolder("物体");
meshFolder.add(mesh.position, "z").min(1).max(9).step(0.01).name("z轴");
meshFolder.add(mesh.position, "y").min(-2).max(2).step(0.01).name("y轴");
meshFolder.add(mesh, "visible").name("是否显示");
meshFolder.add(material, "wireframe").name("是否虚线标识");
const obj = { color: "#ccc", num: 1 };
gui.addColor(obj, "color");
gui
  .add(obj, "num")
  .min(1)
  .max(100)
  .step(1)
  .onFinishChange(() => {});
mesh.position.normalize(); // // 标准化后，这个长度会等于1，但各个分量（x, y, z）加起来通常不等于1。
// 3. 渲染器 renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(size.width, size.height);
// 添加动画循环
const controls = new OrbitControls(camera, canvas);
// Create color pickers for multiple color formats

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
