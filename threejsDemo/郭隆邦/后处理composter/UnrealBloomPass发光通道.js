import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
let scene, camera, renderer, controls, composer;
const width = window.innerWidth;
const height = window.innerHeight;
function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, width / height, 1, 1000);
  camera.position.z = 250;
  renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.setSize(width, height);
  document.body.appendChild(renderer.domElement);
  const geometry = new THREE.BoxGeometry(120, 50, 10);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  controls = new OrbitControls(camera, renderer.domElement);
  const axesHelper = new THREE.AxesHelper(115);
  scene.add(axesHelper);

  //   1. 后期处理
  composer = new EffectComposer(renderer);
  //   2. 通道
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  //   3. 后期具体的处理 发光通道
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(width, height),
    1.5, // strength
    0.1, // radius
    0.5 // threshold
  );
  //   发光强度
  bloomPass.strength = 1;
  composer.addPass(bloomPass);
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
  outlinePass.selectedObjects = [mesh];
  composer.addPass(outlinePass);
  animate();
}
function animate() {
  requestAnimationFrame(animate);
  composer.render();
  controls.update();
}
init();
