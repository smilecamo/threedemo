import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/addons/renderers/CSS2DRenderer.js";

let scene, camera, mesh, group, renderer, controls, css2Renderer;

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(0, 0, 400);
  renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);

  document.body.appendChild(renderer.domElement);
  renderer.render(scene, camera);
  const geometry = new THREE.BoxGeometry(50, 70, 20);
  const material = new THREE.MeshBasicMaterial({ color: 0xff00ff });
  mesh = new THREE.Mesh(geometry, material);
  group = new THREE.Group();
  group.add(mesh);
  mesh.position.x = -100;
  // geometry.translate(0, 30, 0);
  scene.add(group);
  axesHelp(group);
  controls = new OrbitControls(camera, renderer.domElement);
  windowResize();
  css2RendererInit();
  layerInit();
  animate();
}
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
  css2Renderer.render(scene, camera);
}
function windowResize() {
  window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    css2Renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
function axesHelp(mesh, number = 150) {
  let axesHelper = new THREE.AxesHelper(number);
  mesh.add(axesHelper);
}
function css2RendererInit() {
  css2Renderer = new CSS2DRenderer();
  css2Renderer.setSize(window.innerWidth, window.innerHeight);
  css2Renderer.domElement.style.position = "absolute";
  css2Renderer.domElement.style.top = "0px";
  css2Renderer.domElement.style.pointerEvents = "none"; // 禁止标签捕获鼠标事件
  document.body.appendChild(css2Renderer.domElement);
}
function layerInit() {
  const div = document.getElementById("tag");
  const tag = new CSS2DObject(div);
  tag.position.y += 35;
  mesh.add(tag);
}
init();
