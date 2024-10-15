import * as THREE from "three";
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
mesh.position.normalize(); // // 标准化后，这个长度会等于1，但各个分量（x, y, z）加起来通常不等于1。
// 3. 渲染器 renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(size.width, size.height);
// 添加动画循环
renderer.render(scene, camera);
// 监听窗口大小变化
window.addEventListener("resize", () => {
  size.width = window.innerWidth;
  size.height = window.innerHeight;
  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();
  renderer.setSize(size.width, size.height);
  renderer.render(scene, camera);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
// 全屏
document.addEventListener("dblclick", () => {
  const fullscreenElement =
    document.fullscreenElement || document.webkitFullscreenElement;
  // requestFullscreen() 和 exitFullscreen() 的主要区别在于它们的作用对象和调用方式：
  // a) requestFullscreen()：
  // 作用于：特定的 HTML 元素
  // 调用方式：在要全屏显示的元素上调用
  // b) exitFullscreen()：
  // 作用于：整个文档
  // 调用方式：在 document 对象上调用
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
