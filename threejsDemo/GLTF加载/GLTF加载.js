import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";

import { GammaCorrectionShader } from "three/addons/shaders/GammaCorrectionShader.js";
import { SMAAPass } from "three/addons/postprocessing/SMAAPass.js";
import { computedFaceCount } from "./computedModelFaceCount.js";
let scene, camera, renderer, controls, composer, outlinePass, modelGLTF;
let width = window.innerWidth;
let height = window.innerHeight;
let selectedObject = null;
function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(20, width / height, 1, 10000);
  camera.position.set(-65, 607, 947);
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  document.body.appendChild(renderer.domElement);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener("change", () => {
    console.log(camera);
  });
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
  //   outlie描边颜色 默认为白色
  outlinePass.visibleEdgeColor.set(0xffff00);
  //   描边的厚度 默认为1 调整了厚度，发光强度也要相应的调整
  outlinePass.edgeThickness = 2;
  //   发光强度 默认为3
  outlinePass.edgeStrength = 4;
  //模型闪烁频率控制，默认0不闪烁
  outlinePass.pulsePeriod = 1;
  composer.addPass(outlinePass);
  // 创建伽马校正通道
  const gammaPass = new ShaderPass(GammaCorrectionShader);
  composer.addPass(gammaPass);
  //获取.setPixelRatio()设置的设备像素比
  const pixelRatio = renderer.getPixelRatio();
  // width、height是canva画布的宽高度
  const smaaPass = new SMAAPass(width * pixelRatio, height * pixelRatio);
  composer.addPass(smaaPass);
  loadGLTF();
}
// 设置精灵图
function setSprite() {
  const spriteMaterial = new THREE.SpriteMaterial({
    map: new THREE.TextureLoader().load("../image/guang.png"),
  });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(10, 10, 1);
  sprite.position.set(20, 80, 10); //设置位置，要考虑sprite尺寸影响
  sprite.material.depthTest = false; // 禁用深度测试
  sprite.change = function () {
    modelGLTF.position.y -= 5; // 向下移动模型
  };
  scene.add(sprite);
  clickRaycaster(sprite, true);
}
// 加载模型
function loadGLTF() {
  const loader = new GLTFLoader();
  loader.load(
    "../model/matilda/scene.gltf",
    function (gltf) {
      modelGLTF = gltf.scene;
      modelGLTF.position.y -= 45; // 向下移动模型
      scene.add(modelGLTF);
      const hairGroup = modelGLTF.getObjectByName("hairStrands_v1Group65465");
      if (hairGroup) {
        hairGroup.traverse((children) => {
          if (children.isMesh) {
            children.ancestors = hairGroup;
          }
        });
      }
      clickRaycaster(hairGroup.children, false);
      computedFaceCount(modelGLTF).then((res) => {
        console.log("模型的面数:" + res);
      });
      // 畅想-王振
      // 我是群聊“新维畅想”的杨永举 想再次确认模型的面数
      animate(); // 开始动画循环
      setSprite();
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
}

function clickRaycaster(objects, sprite = false) {
  renderer.domElement.addEventListener("click", function (e) {
    const mouse = new THREE.Vector2();
    mouse.x = (e.offsetX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.offsetY / window.innerHeight) * 2 + 1;
    // 创建射线投射器
    const raycaster = new THREE.Raycaster();
    // 屏幕点击哪一块 就从哪一块发射一个射线
    raycaster.setFromCamera(mouse, camera);
    if (sprite) {
      const intersect = raycaster.intersectObject(objects);
      if (intersect.length > 0) {
        intersect[0].object.change();
      }
    } else {
      const intersects = raycaster.intersectObjects(objects);
      if (intersects.length > 0) {
        outlinePass.selectedObjects = [intersects[0].object.ancestors];
      }
    }
  });
}
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  composer.render();
}

init();
