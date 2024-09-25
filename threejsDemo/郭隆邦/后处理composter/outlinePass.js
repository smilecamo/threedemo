import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
// 渲染器通道
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";

let scene, camera, renderer, controls, group, composer;
let width = window.innerWidth;
let height = window.innerHeight;

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, width / height, 1, 1000);
  camera.position.z = 50;

  renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.setSize(width, height);
  //   把渲染器作为参数 创建后处理对象effectComposer
  composer = new EffectComposer(renderer);
  // 创建一个渲染器通道，场景和相机作为参数
  const renderPass = new RenderPass(scene, camera);
  // 设置renderPass通道
  composer.addPass(renderPass);
  //   OutlinePass第一个参数v2的尺寸和canvas画布保持一致,然后是场景和相机
  const outlinePass = new OutlinePass(
    new THREE.Vector2(width, height),
    scene,
    camera
  );
  //   outlie描边颜色 默认为白色
  outlinePass.visibleEdgeColor.set(0xffff00);
  //   描边的厚度 默认为1 调整了厚度，发光强度也要相应的调整
  outlinePass.edgeThickness = 5;
  //   发光强度 默认为3
  outlinePass.edgeStrength = 10;
  //模型闪烁频率控制，默认0不闪烁
  outlinePass.pulsePeriod = 2;
  composer.addPass(outlinePass);
  document.body.appendChild(renderer.domElement);
  controls = new OrbitControls(camera, renderer.domElement);
  const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
  const geometry = new THREE.BoxGeometry(20, 10, 30);
  const mesh = new THREE.Mesh(geometry, material);
  outlinePass.selectedObjects = [mesh];
  scene.add(mesh);
  const axesHelper = new THREE.AxesHelper(115);
  scene.add(axesHelper);
  animate();
}

function animate() {
  composer.render();
  controls.update(); // 更新轨道控制器
  requestAnimationFrame(animate);
}

init();
