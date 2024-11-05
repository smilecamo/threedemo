import NX from "./public/assets/textures/environmentMaps/0/nx.jpg";
import NY from "./public/assets/textures/environmentMaps/0/ny.jpg";
import NZ from "./public/assets/textures/environmentMaps/0/nz.jpg";
import PX from "./public/assets/textures/environmentMaps/0/px.jpg";
import PY from "./public/assets/textures/environmentMaps/0/py.jpg";
import PZ from "./public/assets/textures/environmentMaps/0/pz.jpg";

import * as CANNON from "cannon-es";
import * as dat from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
console.log(PX, NY, PZ, NZ, PY, NX);
const cubeTextLoader = new THREE.CubeTextureLoader();
const environmentMapTexture = cubeTextLoader.load([PX, NX, PY, NY, PZ, NZ]);

/**
 * basic setup
 */
const canvas = document.querySelector("canvas.webgl");
const gui = new dat.GUI();
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const scene = new THREE.Scene();

/**
 * 灯光 平行光
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);
/**
 * 地板
 */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({
    color: "#777777",
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5,
  })
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);
/**
 * 物体 球体
 */
const sphereGeometry = new THREE.SphereGeometry(1, 20, 20);
const sphereMaterial = new THREE.MeshStandardMaterial({
  // 金属度 - 控制材质的金属感,0为非金属,1为金属
  metalness: 0.3,
  // 粗糙度 - 控制材质的粗糙程度,0为光滑,1为完全粗糙
  roughness: 0.4,
  // 环境贴图 - 用于反射周围环境,增加真实感
  envMap: environmentMapTexture,
});

const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphereMesh.castShadow = true;
sphereMesh.position.y = 3;
scene.add(sphereMesh);

/**
 * 相机
 */
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);
// 创建相机
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);
cameraGroup.add(camera);

camera.position.set(3, 4, 15);

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // 阻尼效果

/**
 * 物理世界 CANNON
 */

/**
 * 创建物理世界
 * CANNON.World() 创建一个物理世界实例,用于模拟物理效果
 * 文档: https://pmndrs.github.io/cannon-es/docs/classes/World.html
 */
const world = new CANNON.World();

/**
 * 设置物理世界的重力
 * gravity.set(x, y, z) 设置重力向量
 * 参数说明:
 * - x: 水平方向重力,通常为0
 * - y: 垂直方向重力,通常为-9.82(地球重力加速度)
 * - z: 深度方向重力,通常为0
 * 示例:
 * - world.gravity.set(0, -9.82, 0) 模拟地球重力
 * - world.gravity.set(0, 0, 0) 无重力环境
 */
world.gravity.set(0, -9.82, 0);
/**
 * 创建物理材质
 * CANNON.Material() 用于创建物理材质,定义物体表面的物理属性
 * 参数说明:
 * - name: 材质名称,用于标识不同材质
 * const concreteMaterial = new CANNON.Material("concrete");
 * const plasticMaterial = new CANNON.Material("plastic");
 */
const defaultMaterial = new CANNON.Material("default");
/**
 * 创建接触材质
 * CANNON.ContactMaterial() 用于定义两种材质接触时的物理特性
 * 参数说明:
 * - material1, material2: 接触的两种材质
 * - options: 接触属性配置
 *   - friction: 摩擦系数(0-1),值越大摩擦力越大
 *   - restitution: 弹性系数(0-1),值越大反弹越强
 * const concretePlasticContactMaterial = new CANNON.ContactMaterial(
  concreteMaterial,
  plasticMaterial,
  {
    friction: 0.1, // 较小的摩擦系数,使物体容易滑动
    restitution: 0.7, // 较高的弹性系数,使物体有较好的弹跳效果
  }
);
 */
const defaultContactMaterial = new CANNON.ContactMaterial(
  defaultMaterial,
  defaultMaterial,
  {
    friction: 0.1,
    restitution: 0.7,
  }
);
// 将接触材质添加到物理世界中 world.addContactMaterial(concretePlasticContactMaterial);
/**
 * 将默认接触材质添加到物理世界
 * addContactMaterial() 用于注册材质的接触属性
 * defaultContactMaterial 设置为世界的默认接触材质
 */
world.addContactMaterial(defaultContactMaterial);
world.defaultContactMaterial = defaultContactMaterial;
/**
 * 创建球体的物理形状
 * CANNON.Sphere(radius) 创建球形碰撞体
 * 参数说明:
 * - radius: 球体半径(单位:米)
 * 示例:
 * - new CANNON.Sphere(0.5) 创建半径为0.5米的球体
 * - new CANNON.Sphere(1) 创建半径为1米的球体
 */
const sphereShape = new CANNON.Sphere(1);

/**
 * 创建球体的物理实体
 * CANNON.Body() 创建刚体,用于物理模拟
 * 文档: https://pmndrs.github.io/cannon-es/docs/classes/Body.html
 */
const sphereBody = new CANNON.Body({
  // 设置球体的初始位置 (x=0, y=3, z=0)
  // CANNON.Vec3 用于创建三维向量,类似 THREE.Vector3
  // 例如: new CANNON.Vec3(1,2,3) 表示位置在 x=1, y=2, z=3 的点
  position: new CANNON.Vec3(0, 3, 0),
  // 设置球体的质量(单位:kg)
  // mass > 0: 动态物体,会受重力影响
  // mass = 0: 静态物体,不受重力影响,常用于地面等固定物体
  // 例如: mass=1 表示1kg, mass=10 表示10kg
  mass: 1,
  // 设置物体的碰撞形状
  // CANNON.Sphere: 球形碰撞体,参数为半径
  // 其他常用形状:
  // - CANNON.Box: 立方体,参数为半宽、半高、半深
  // - CANNON.Plane: 无限平面
  // - CANNON.Cylinder: 圆柱体
  shape: sphereShape,
  // material: defaultMaterial, // 设置材质
});
/**
 * 给球体施加局部力
 * applyLocalForce() 在物体的局部坐标系中施加力
 * 参数说明:
 * 1. force: 力的大小和方向向量
 *    - new CANNON.Vec3(150, 0, 0) 表示在x轴方向施加150N的力
 * 2. localPoint: 力的作用点(相对于物体中心的局部坐标)
 *    - new CANNON.Vec3(0, 0, 0) 表示在物体中心施加力
 * 示例:
 * - 向右推: new CANNON.Vec3(100, 0, 0)
 * - 向上推: new CANNON.Vec3(0, 100, 0)
 */
sphereBody.applyLocalForce(
  new CANNON.Vec3(150, 0, 0),
  new CANNON.Vec3(0, 0, 0)
);

/**
 * 将球体添加到物理世界
 * world.addBody() 用于将物理实体添加到物理世界进行模拟
 * 示例:
 * - world.addBody(sphereBody) 添加球体
 * - world.addBody(floorBody) 添加地面
 */
world.addBody(sphereBody);
/**
 * 创建地面的物理形状和实体
 * CANNON.Plane() 创建无限平面碰撞体,常用于地面
 * 文档: https://pmndrs.github.io/cannon-es/docs/classes/Plane.html
 */
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body({
  mass: 0, // 质量为0,使其成为静态物体
  shape: floorShape, // 设置碰撞形状为平面
  // material: constraint,
});

// 旋转地面使其水平
// quaternion.setFromAxisAngle() 用于设置物体的旋转
// 参数1: 旋转轴,这里是 x 轴的负方向 new CANNON.Vec3(-1, 0, 0)
// 参数2: 旋转角度,这里旋转90度(Math.PI * 0.5)
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);
world.addBody(floorBody);
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  renderer.setSize(sizes.width, sizes.height);
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
});

const clock = new THREE.Clock();
let oldElapsedTime = 0;
const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  // 计算两帧之间的时间差
  const deltaTime = elapsedTime - oldElapsedTime;
  // 更新上一帧的时间
  oldElapsedTime = elapsedTime;
  // 在每一帧给球体施加一个持续的力
  // applyForce方法接受两个参数:
  // 1. 力的大小和方向 (x=-0.6表示向左的力)
  // 2. 力的作用点 (这里是球体的当前位置)
  sphereBody.applyForce(
    new CANNON.Vec3(-0.6, 0, 0), // 向左的力
    sphereBody.position // 在球体当前位置施加力
  );
  // 更新物理世界
  // 参数1: 固定时间步长(1/60秒)
  // 参数2: 两帧之间的实际时间差
  // 参数3: 最大允许的子步数
  world.step(1 / 60, deltaTime, 3);
  // 同步物理世界的球的运动
  sphereMesh.position.copy(sphereBody.position);

  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};
tick();
