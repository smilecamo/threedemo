import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

const gui = new GUI();
const canvas = document.querySelector("canvas.webgl");
// 2. 场景
const scene = new THREE.Scene();
// 通过 material 贴图的方式添加阴影
const loader = new THREE.TextureLoader();
const simpleShadow = loader.load(
  "/public/assets/textures/shadows/simpleShadow.jpg"
);
// 添加地面平面
const planeGeometry = new THREE.PlaneGeometry(10, 10);
const planeMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
});
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.rotation.x = -Math.PI / 2; // 旋转平面使其水平
planeMesh.position.y = -0.7; // 将平面下移，使其位于其他物体下方
planeMesh.receiveShadow = true;
// "receive" 的意思是“接收”或“收到”，通常指的是接受某种东西，如信息、礼物、信号等。
// re-: 这是一个前缀，意思是“再次”或“返回”。
// ceive: 这是一个词根，意思是“拿”或“取”。
scene.add(planeMesh);
// 通过 plane 平面加上material环境贴图的方式加载阴影 缺点是不能改变方向
// 使用材质环境贴图来模拟阴影确实存在一些缺点：
// a) 缺乏动态性：环境贴图是静态的，无法随物体或光源的移动而实时变化。
// b) 方向限制：阴影的方向是固定的，无法根据光源位置的变化而改变。
// c) 精确度不足：这种方法只能提供近似的阴影效果，无法准确反映场景中物体的形状和位置。
// d) 性能消耗：高质量的环境贴图可能会占用大量内存，影响加载速度和运行性能。
// e) 缺乏深度信息：环境贴图无法提供真实的阴影深度信息，导致阴影看起来可能不够真实。
// f) 难以与其他物体交互：这种阴影无法正确地在其他物体表面上投射或接收。
const planeShadow = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1),
  new THREE.MeshBasicMaterial({
    color: "red",
    transparent: true,
    alphaMap: simpleShadow,
  })
);
planeShadow.rotation.x = -Math.PI / 2; // 旋转平面使其水平
planeShadow.position.y = planeMesh.position.y + 0.01; // 将平面下移，使其位于其他物体下方
scene.add(planeShadow);
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 10, 10);
scene.add(light);
// 定义材质
const material = new THREE.MeshStandardMaterial({
  color: 0xffffff, // 设置一个默认颜色
});

// 1. 物体
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 16);
const torusGeometry = new THREE.TorusGeometry(0.25, 0.2);
const box = new THREE.Mesh(boxGeometry, material);
const sphereMesh = new THREE.Mesh(sphereGeometry, material);
const torusMesh = new THREE.Mesh(torusGeometry, material);
scene.add(box);
box.position.x = 2;
scene.add(sphereMesh);
torusMesh.position.x = -2;
scene.add(torusMesh);
// 3. 相机
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
// Perspective 可以拆分为以下部分：
// Per-：这是一个前缀，表示“通过”或“彻底”。它来自拉丁语，常见于表示程度或方式的词语中，如 perceive（感知）和 perfect（完美）。
// Spec-：这个部分是词根，来自拉丁语 “specere”，意思是“看”。许多与视觉、观看相关的词汇都有这个词根，如 inspect（检查）、spectacle（景象）。
// -ive：这是一个后缀，通常表示形容词或名词的词尾，用来构成描述性的单词。
// 拆解记忆法：
// Per（通过） + Spec（看）+ ive（形容词或名词后缀） → 从不同角度“看”，引申为“视角、看法”。
camera.position.z = 10;
const axesHelper = new THREE.AxesHelper();
scene.add(axesHelper);
// 4. 渲染器
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // 阻尼效果
const clock = new THREE.Clock();
function animate() {
  const elapsedTime = clock.getElapsedTime();
  // 更新球体位置
  sphereMesh.position.x = Math.sin(elapsedTime) * 3; // 球体在x轴上做正弦运动，范围为-3到3
  sphereMesh.position.z = Math.cos(elapsedTime) * 3; // 球体在z轴上做余弦运动，范围为-3到3
  sphereMesh.position.y = Math.abs(Math.sin(elapsedTime * 3)); // 球体在y轴上做正弦运动，但取绝对值，使其只在0到1之间上下移动

  // 更新阴影平面位置
  planeShadow.position.x = sphereMesh.position.x; // 阴影平面的x坐标跟随球体
  planeShadow.position.z = sphereMesh.position.z; // 阴影平面的z坐标跟随球体

  // 更新阴影平面的不透明度
  planeShadow.material.opacity = (1 - sphereMesh.position.y) * 0.4; // 根据球体的高度调整阴影的不透明度，球体越高，阴影越淡
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
