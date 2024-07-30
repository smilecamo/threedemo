import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { GammaCorrectionShader } from "three/addons/shaders/GammaCorrectionShader.js";
import { SMAAPass } from "three/addons/postprocessing/SMAAPass.js";

let scene, camera, renderer, controls, composer, outlinePass;
let width = window.innerWidth;
let height = window.innerHeight;
let selectedObject = null;

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(20, width / height, 1, 10000);
  camera.position.set(42, 500, 1000);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  const axesHelper = new THREE.AxesHelper(150);
  scene.add(axesHelper);

  composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  outlinePass = new OutlinePass(
    new THREE.Vector2(width, height),
    scene,
    camera
  );
  outlinePass.visibleEdgeColor.set(0xffff00);
  outlinePass.edgeThickness = 5;
  outlinePass.edgeStrength = 10;
  outlinePass.pulsePeriod = 2;
  composer.addPass(outlinePass);

  const gammaPass = new ShaderPass(GammaCorrectionShader);
  composer.addPass(gammaPass);

  const pixelRatio = renderer.getPixelRatio();
  const smaaPass = new SMAAPass(width * pixelRatio, height * pixelRatio);
  composer.addPass(smaaPass);

  const loader = new GLTFLoader();
  loader.load(
    "../model/matilda/scene.gltf",
    function (gltf) {
      const model = gltf.scene;
      model.position.y -= 50;
      scene.add(model);

      const hairGroup = model.getObjectByName("hairStrands_v1Group65465");
      if (hairGroup) {
        hairGroup.traverse((child) => {
          if (child.isMesh) {
            child.ancestors = hairGroup;
          }
        });
      }
      clickRaycaster(hairGroup.children);
      animate();
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
}

function clickRaycaster(objects) {
  renderer.domElement.addEventListener("click", function (e) {
    const mouse = new THREE.Vector2();
    mouse.x = (e.offsetX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.offsetY / window.innerHeight) * 2 + 1;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(objects);
    if (intersects.length > 0) {
      const intersected = intersects[0].object;
      outlinePass.selectedObjects = [intersected.ancestors];
    }
  });
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  composer.render();
}

init();
