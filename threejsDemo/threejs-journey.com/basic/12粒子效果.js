import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
const canvas = document.querySelector("canvas.webgl");
//  场景
const scene = new THREE.Scene();
const texture = new THREE.TextureLoader();
const particles = texture.load("./public/assets/textures/particles/2.png");
// 物体 geometry
// const cube = new THREE.SphereGeometry(1, 32, 32);
// 随机点
const count = 5000;
const positions = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);
for (let i = 0; i < count; i++) {
  positions[i] = (Math.random() - 0.5) * 10;
  colors[i] = Math.random();
}
const cube = new THREE.BufferGeometry();
cube.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3) // 每个位置有3个值 (x,y,z)
);
cube.setAttribute(
  "color",
  new THREE.BufferAttribute(colors, 3) // 每个颜色有3个值 (r,g,b)
);
// 材质
const material = new THREE.PointsMaterial({
  size: 0.5, // 尺寸
  // color: 0x87ceeb, // 颜色
  sizeAttenuation: true, // 随着相机距离增加而变小
  // map: particles, // 贴图 缺点 前面的会覆盖后面的 ,这是因为绘制的顺序问题
  transparent: true, // 透明
  alphaMap: particles, // 透明贴图 缺点 只使用透明贴图 还是解决不了
  // alphaTest: 0.01, // 透明度测试 结合 alphaMap 还是解决不了 覆盖问题，这个时候边缘部分会覆盖
  // depthTest: false, // 原理是不管渲染顺序都渲染， 深度测试单个颜色和没有其他的几何体混合的时候可以，不然会被几何体内呈现
  depthWrite: false, // 默认最优解
  blending: THREE.AdditiveBlending, // 混合模式
  vertexColors: true, // 使用顶点颜色
});
const points = new THREE.Points(cube, material);
scene.add(points);
// 相机
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  2,
  100
);
const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);
// 设置相机位置
camera.position.set(0, 0, 15); // 添加此行
scene.add(camera);
// 渲染器
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.render(scene, camera);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
// 添加窗口大小调整监听
window.addEventListener("resize", () => {
  // 更新相机宽高比
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  // 更新渲染器尺寸
  renderer.setSize(window.innerWidth, window.innerHeight);
});
const clock = new THREE.Clock();
function animate() {
  const elapsedTime = clock.getElapsedTime(); // 获取时间差
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    // cube.attributes.position.array[i3 + 1] = Math.sin(elapsedTime); // 修改y轴 只会上下
    const x = cube.attributes.position.array[i3 + 0]; // x 轴
    cube.attributes.position.array[i3 + 1] = Math.sin(elapsedTime + x); // 修改y轴 加 x 轴
  }
  cube.attributes.position.needsUpdate = true; // 通过 attributes 修改需要 告诉threejs 位置数据已经改变 需要发生渲染
  window.requestAnimationFrame(animate);
  // 更新控制器
  controls.update(); // 添加此行
  renderer.render(scene, camera);
}
animate();
