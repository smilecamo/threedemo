import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/addons/renderers/CSS2DRenderer.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

let scene, camera, group, renderer, controls, css2Renderer, gltfModel;

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(0, 0, 30);
  renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.setClearColor(0xc9ccd5);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  renderer.render(scene, camera);
  group = new THREE.Group();
  loadObject();
  const light = new THREE.AmbientLight(0x404040); // 柔和的白光
  scene.add(light);
  scene.add(group);
  axesHelp(group);
  controls = new OrbitControls(camera, renderer.domElement);
  windowResize();
  css2RendererInit();

  animate();
}
function loadObject() {
  new GLTFLoader().load(
    "../model/che/scene.gltf",
    function (gltf) {
      gltfModel = gltf.scene;
      group.add(gltfModel);
      layerInit();
    },
    function (xhr) {
      let progress = (xhr.loaded / xhr.total) * 100 + "% loaded";
      console.log(progress);
    },
    function (error) {}
  );
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
  let hairGroup = gltfModel.getObjectByName("Cube.005_0");
  console.log(gltfModel);
  // console.log("hairGroup", hairGroup);
  // if (hairGroup) {
  //   hairGroup.traverse((children) => {
  //     if (children.isMesh) {
  //       children.ancestors = hairGroup;
  //     }
  //   });
  // }
  axesHelp(hairGroup);
  hairGroup.add(tag);
}
init();
