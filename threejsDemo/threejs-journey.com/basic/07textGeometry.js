import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

const gui = new GUI();
const canvas = document.querySelector("canvas.webgl");
const matcapTexture = new THREE.TextureLoader().load(
  "/public/assets/textures/matcaps/2.png"
);
// 2. 场景
const scene = new THREE.Scene();
// 1. 文字物体
const fontLoader = new FontLoader();
let textMesh; // 用于存储文本网格对象

fontLoader.load(
  "/public/assets/font/helvetiker_regular.typeface.json",
  (font) => {
    const params = {
      text: "hello word",
      size: 0.5, // 文字的大小
      depth: 0.1, // depth最好设置是size的1/5到1/3
      curveSegments: 12, // 曲线的分段数，影响圆滑程度
      bevelEnabled: true, // 是否启用斜角效果
      bevelThickness: 0.03, // 斜角的厚度
      bevelSize: 0.02, // 斜角向外扩展的大小。
      bevelOffset: 0, // 斜角的偏移量
      bevelSegments: 5, // 斜角的段数
    };

    function createText() {
      // 如果已存在文本网格，则从场景中移除
      if (textMesh) {
        scene.remove(textMesh);
      }

      const textGeometry = new TextGeometry(params.text, {
        font: font,
        size: params.size,
        depth: params.depth,
        curveSegments: params.curveSegments,
        bevelEnabled: params.bevelEnabled,
        bevelThickness: params.bevelThickness,
        bevelSize: params.bevelSize,
        bevelOffset: params.bevelOffset,
        bevelSegments: params.bevelSegments,
      });

      const textMaterial = new THREE.MeshMatcapMaterial({
        matcap: matcapTexture,
      });
      textMesh = new THREE.Mesh(textGeometry, textMaterial);
      // 计算边界框 不返回值，是更新几何体的boundingBox属性，通过几何体.getBoundingBox()获取
      textGeometry.computeBoundingBox();
      // textMesh.position.x = -textGeometry.boundingBox.max.x * 0.5;
      // textMesh.position.y = -textGeometry.boundingBox.max.y * 0.5;
      // 计算居中偏移量
      const centerOffset = new THREE.Vector3();
      textGeometry.boundingBox.getCenter(centerOffset).multiplyScalar(-1);
      textMesh.position.copy(centerOffset);
      scene.add(textMesh);
      const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45);
      for (let i = 0; i < 300; i++) {
        const donut = new THREE.Mesh(donutGeometry, textMaterial);
        donut.position.x = (Math.random() - 0.5) * 20;
        donut.position.y = (Math.random() - 0.5) * 20;
        donut.position.z = (Math.random() - 0.5) * 20;
        donut.rotation.x = Math.random() * Math.PI;
        donut.rotation.y = Math.random() * Math.PI;
        scene.add(donut);
      }
    }

    // 初始创建文本
    createText();

    // 添加 GUI 控制
    gui.add(params, "text").onChange(createText);
    gui.add(params, "size", 0.1, 10).onChange(createText);
    gui.add(params, "depth", 0.1, 0.167).onChange(createText);
    gui.add(params, "curveSegments", 1, 20, 1).onChange(createText);
    gui.add(params, "bevelEnabled").onChange(createText);
    gui.add(params, "bevelThickness", 0.01, 0.1).onChange(createText);
    gui.add(params, "bevelSize", 0.01, 0.1).onChange(createText);
    gui.add(params, "bevelOffset", -0.1, 0.1).onChange(createText);
    gui.add(params, "bevelSegments", 1, 10, 1).onChange(createText);

    // 调整相机位置
    camera.position.z = 4;
  }
);

// 3. 相机
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  1,
  1000
);
const axesHelper = new THREE.AxesHelper();
scene.add(axesHelper);
// 4. 渲染器
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new OrbitControls(camera, renderer.domElement);
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
