import * as THREE from "three";
import {
  CSS2DObject,
  CSS2DRenderer,
} from "three/examples/jsm/renderers/CSS2DRenderer";

export class MeasurementTool {
  constructor(scene, camera, renderer) {
    // 场景、相机和渲染器的引用
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;

    // 测量工具的状态控制
    this.enabled = false; // 是否启用测量功能
    this.measurements = []; // 存储所有测量结果
    this.points = []; // 存储当前测量的点
    this.modelDimensions = []; // 存储模型尺寸标注对象
    this.showModelDimensions = true; // 控制尺寸标注的显示/隐藏
    this.model = null; // 当前模型的引用

    // 初始化设置
    this.setupCSS2DRenderer();
    this.setupEventListeners();
  }

  /**
   * 设置CSS 2D渲染器，用于显示测量标签
   */
  setupCSS2DRenderer() {
    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
    this.labelRenderer.domElement.style.position = "absolute";
    this.labelRenderer.domElement.style.top = "0px";
    this.labelRenderer.domElement.style.pointerEvents = "none";
    document.body.appendChild(this.labelRenderer.domElement);
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    // 监听键盘事件，切换测量模式
    window.addEventListener("keydown", (e) => {
      if (e.key === "m" || e.key === "M") {
        this.enabled = !this.enabled;
        document.getElementById("mode").textContent = `当前模式: ${
          this.enabled ? "测量" : "查看"
        }`;
      }
    });

    // 监听点击事件，进行测量
    window.addEventListener("click", this.onClick.bind(this));

    // 监听窗口大小变化
    window.addEventListener("resize", () => {
      this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  /**
   * 获取模型的实际尺寸
   * @param {THREE.Object3D} model - 要测量的模型
   * @returns {Object} 包含宽、高、深的尺寸对象
   */
  getModelDimensions(model) {
    // 保存当前缩放值
    const currentScale = model.scale.clone();

    // 临时重置缩放为1，以获取原始尺寸
    model.scale.set(1, 1, 1);

    // 创建包围盒并计算尺寸
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    box.getSize(size);

    // 恢复原始缩放
    model.scale.copy(currentScale);

    // 单位转换（如果需要）
    const unitConversion = 1; // 1 = 米, 0.001 = 毫米, 0.01 = 厘米

    // 计算最终尺寸
    const dimensions = {
      width: size.x * unitConversion,
      height: size.y * unitConversion,
      depth: size.z * unitConversion,
    };

    // 输出尺寸信息到控制台
    console.log("模型原始尺寸（米）:", {
      width: dimensions.width.toFixed(3),
      height: dimensions.height.toFixed(3),
      depth: dimensions.depth.toFixed(3),
    });

    return dimensions;
  }

  /**
   * 测量模型尺寸并创建可视化
   * @param {THREE.Object3D} model - 要测量的模型
   */
  measureModel(model) {
    this.model = model;
    this.clearModelDimensions();

    // 获取模型尺寸
    const dimensions = this.getModelDimensions(model);

    // 获取当前包围盒（用于放置标签）
    const box = new THREE.Box3().setFromObject(model);

    // 创建包围盒辅助对象
    const boxHelper = new THREE.Box3Helper(box, 0x00ff00);
    this.modelDimensions.push(boxHelper);
    this.scene.add(boxHelper);

    // 创建尺寸标签
    const labels = [
      {
        text: `宽: ${dimensions.width.toFixed(3)} m`,
        position: new THREE.Vector3(
          box.min.x + (box.max.x - box.min.x) / 2,
          box.min.y,
          box.min.z
        ),
      },
      {
        text: `高: ${dimensions.height.toFixed(3)} m`,
        position: new THREE.Vector3(
          box.min.x,
          box.min.y + (box.max.y - box.min.y) / 2,
          box.min.z
        ),
      },
      {
        text: `深: ${dimensions.depth.toFixed(3)} m`,
        position: new THREE.Vector3(
          box.min.x,
          box.min.y,
          box.min.z + (box.max.z - box.min.z) / 2
        ),
      },
    ];

    // 创建并添加标签
    labels.forEach((label) => {
      const labelDiv = document.createElement("div");
      labelDiv.className = "measurement-label";
      labelDiv.textContent = label.text;

      const labelObject = new CSS2DObject(labelDiv);
      labelObject.position.copy(label.position);
      this.modelDimensions.push(labelObject);
      this.scene.add(labelObject);
    });

    this.updateModelDimensionsVisibility();
  }

  /**
   * 处理点击事件
   * @param {MouseEvent} event - 鼠标点击事件
   */
  onClick(event) {
    if (!this.enabled || !this.model) return;

    // 计算鼠标在归一化设备坐标中的位置
    const rect = this.renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    // 创建射线
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    // 进行射线检测
    const intersects = raycaster.intersectObject(this.model, true);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      this.points.push(point);

      // 创建点的可视化
      const sphereGeometry = new THREE.SphereGeometry(0.02);
      const sphereMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        depthTest: false,
      });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.copy(point);
      this.scene.add(sphere);

      // 如果有两个点，创建测量
      if (this.points.length === 2) {
        this.createMeasurement(this.points[0], this.points[1]);
        this.points = [];
      }
    }
  }

  /**
   * 创建两点之间的测量
   * @param {THREE.Vector3} start - 起始点
   * @param {THREE.Vector3} end - 结束点
   */
  createMeasurement(start, end) {
    // 创建测量线
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    const material = new THREE.LineBasicMaterial({
      color: 0xff0000,
      depthTest: false,
      linewidth: 2,
    });
    const line = new THREE.Line(geometry, material);

    // 计算实际距离
    const distance = start.distanceTo(end) / this.model.scale.x;

    // 创建距离标签
    const labelDiv = document.createElement("div");
    labelDiv.className = "measurement-label";
    labelDiv.textContent = `${distance.toFixed(3)} m`;

    const label = new CSS2DObject(labelDiv);
    const midPoint = new THREE.Vector3()
      .addVectors(start, end)
      .multiplyScalar(0.5);
    label.position.copy(midPoint);

    // 保存测量结果并添加到场景
    this.measurements.push({ line, label, points: [start, end] });
    this.scene.add(line);
    this.scene.add(label);
  }

  /**
   * 清除所有模型尺寸标注
   */
  clearModelDimensions() {
    this.modelDimensions.forEach((obj) => {
      this.scene.remove(obj);
    });
    this.modelDimensions = [];
  }

  /**
   * 更新模型尺寸标注的可见性
   */
  updateModelDimensionsVisibility() {
    this.modelDimensions.forEach((obj) => {
      obj.visible = this.showModelDimensions;
    });
  }

  /**
   * 清除所有测量
   */
  clearMeasurements() {
    // 清除测量线和标签
    this.measurements.forEach((measurement) => {
      this.scene.remove(measurement.line);
      this.scene.remove(measurement.label);
    });
    this.measurements = [];

    // 清除测量点
    const measurementPoints = this.scene.children.filter(
      (obj) => obj.isMesh && obj.geometry instanceof THREE.SphereGeometry
    );
    measurementPoints.forEach((point) => {
      this.scene.remove(point);
    });

    // 重置当前点
    this.points = [];
  }

  /**
   * 更新渲染
   */
  update() {
    this.labelRenderer.render(this.scene, this.camera);
  }
}
