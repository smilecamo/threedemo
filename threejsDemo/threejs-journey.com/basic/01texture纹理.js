import GUI from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
// gui的一些配置
const gui = new GUI({
  width: 300,
  title: "debug ui",
  closeFolders: true,
});
const canvas = document.querySelector("canvas.webgl");
// 1. 场景 scene
const scene = new THREE.Scene();
// 1.1 geometry

const geometry = new THREE.BoxGeometry(1, 1, 1);
// ----------------------------------------texture纹理
// Texture构造函数参数说明：
// new THREE.Texture(
//   image,        // 类型: Image 或 HTMLCanvasElement 或 HTMLVideoElement
//                 // 描述: 纹理的图像源。可以是图像、画布或视频元素。
//   mapping,      // 类型: THREE.Mapping
//                 // 描述: 纹理的映射方式。默认值是 THREE.UVMapping。
//   wrapS,        // 类型: THREE.Wrapping
//                 // 描述: 纹理在 S（U）方向上的包裹方式。默认值是 THREE.ClampToEdgeWrapping。
//   wrapT,        // 类型: THREE.Wrapping
//                 // 描述: 纹理在 T（V）方向上的包裹方式。默认值是 THREE.ClampToEdgeWrapping。
//   magFilter,    // 类型: THREE.TextureFilter
//                 // 描述: 纹理在放大时的过滤方式。默认值是 THREE.LinearFilter。
//   minFilter,    // 类型: THREE.TextureFilter
//                 // 描述: 纹理在缩小时的过滤方式。默认值是 THREE.LinearMipmapLinearFilter。
//   format,       // 类型: THREE.PixelFormat
//                 // 描述: 纹理的像素格式。默认值是 THREE.RGBAFormat。
//   type,         // 类型: THREE.TextureDataType
//                 // 描述: 纹理的数据类型。默认值是 THREE.UnsignedByteType。
//   anisotropy,   // 类型: Number
//                 // 描述: 各向异性过滤的级别。默认值是 1。
//   colorSpace    // 类型: THREE.ColorSpace
//                 // 描述: 纹理的颜色空间。默认值是 THREE.NoColorSpace。
// );
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load(
  "/public/tetxures/Stylized_Wood_Floor_001_height.png"
);
const ambientOcclusionTexture = textureLoader.load(
  "/public/tetxures/Stylized_Wood_Floor_001_ambientOcclusion.png"
);
// repeat 重复几次 texture.repeat 属性用于设置纹理在 UV 坐标系中的重复次数。repeat.x 和 repeat.y 分别控制纹理在 U 和 V 方向上的重复次数。
// 重复的时候的包裹方式 wrapS 是 X轴 U方向，wrapT是Y轴V方向
// THREE.ClampToEdgeWrapping：纹理边缘被拉伸。
// THREE.RepeatWrapping：纹理重复。
// THREE.MirroredRepeatWrapping：纹理镜像重复。
texture.repeat.x = 2;
texture.repeat.y = 2;
texture.wrapS = THREE.MirroredRepeatWrapping;
texture.wrapT = THREE.MirroredRepeatWrapping;

// 纹理的偏移
texture.offset.x = 0.5;
gui.add(texture.offset, "x").min(0).max(1).step(0.1).name("纹理的X偏移");
gui.add(texture.offset, "y").min(0).max(1).step(0.1).name("纹理的Y偏移");
// 旋转一般是原点 （通常是左下角
texture.center.set(0.5, 0.5); // 设置旋转中心为纹理的中心点 texture.center 是一个 THREE.Vector2 对象，表示旋转中心的 UV 坐标（范围是 0 到 1）
gui
  .add(texture, "rotation")
  .min(0)
  .max(Math.PI * 2)
  .step(Math.PI * 0.1)
  .name("纹理旋转");
texture.minFilter = THREE.NearestFilter; // NearestFilter返回与指定纹理坐标（在曼哈顿距离之内）最接近的纹理元素的值。
texture.magFilter = THREE.NearestFilter; // 放大时使用最接近的纹理元素的值。
// 1.2 material 材质
const material = new THREE.MeshBasicMaterial({ map: texture });
// 1.3 mesh 网格
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// 辅助坐标
const axesHelper = new THREE.AxesHelper();
scene.add(axesHelper);
const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};
// 2. 相机 camera
const camera = new THREE.PerspectiveCamera(
  45,
  size.width / size.height,
  0.1,
  1000
);
camera.position.z = 4;

camera.lookAt(mesh.position);
console.log(mesh.position.distanceTo(camera.position)); // 物体到相机的距离 默认为0
// scale、position、rotation 都是继承 Object3D
// 设置网格的位置
mesh.position.set(0, 0, 0);
// 设置网格的缩放
mesh.scale.set(0.5, 0.5, 0.5);
// -------------------------------GUI

// 隐藏gui
// gui.hide();
window.addEventListener("keydown", (event) => {
  if (event.key === "h") {
    gui.show(gui.hide());
  }
});
const cameraFolder = gui.addFolder("相机");
cameraFolder.add(camera.position, "z").min(1).max(9).step(0.01).name("z轴");
cameraFolder.add(camera.position, "y").min(-2).max(2).step(0.01).name("y轴");
const meshFolder = gui.addFolder("物体");
meshFolder.add(mesh.position, "z").min(1).max(9).step(0.01).name("z轴");
meshFolder.add(mesh.position, "y").min(-2).max(2).step(0.01).name("y轴");
meshFolder.add(mesh, "visible", false).name("是否显示");
meshFolder.add(material, "wireframe").name("是否虚线标识");
mesh.position.normalize(); // // 标准化后，这个长度会等于1，但各个分量（x, y, z）加起来通常不等于1。
// 3. 渲染器 renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(size.width, size.height);
// 添加动画循环
const controls = new OrbitControls(camera, canvas);
// Create color pickers for multiple color formats

renderer.render(scene, camera);
const animate = () => {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
};
animate();

// 监听窗口大小变化
window.addEventListener("resize", () => {
  size.width = window.innerWidth;
  size.height = window.innerHeight;
  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();
  renderer.setSize(size.width, size.height);
  // 更新控制器
  renderer.render(scene, camera);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
// 全屏
