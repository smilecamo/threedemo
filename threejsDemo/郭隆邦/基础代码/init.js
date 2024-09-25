import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

let scene, camera, mesh, group, renderer, controls;

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
  const geometry = new THREE.BoxGeometry(50, 120, 20);
  const material = new THREE.MeshBasicMaterial({ color: 0xff00ff });
  mesh = new THREE.Mesh(geometry, material);
  group = new THREE.Group();
  group.add(mesh);
  scene.add(group);
  axesHelp(group);
  controls = new OrbitControls(camera, renderer.domElement);
  animate();
  windowResize();
}
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
function windowResize() {
  window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
function axesHelp(mesh, number = 150) {
  let axesHelper = new THREE.AxesHelper(number);
  mesh.add(axesHelper);
}
init();
