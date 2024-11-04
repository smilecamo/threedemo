import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min";
import { MeasurementTool } from "./MeasurementTool";
import { ModelLoader } from "./ModelLoader";

class App {
  constructor() {
    this.initialize();
    this.setupScene();
    this.setupControls();
    this.setupMeasurementTool();
    this.setupGUI();
    this.setupFileInput();
    this.loadModel();
    this.animate();
  }

  initialize() {
    // 创建渲染器
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.body.appendChild(this.renderer.domElement);

    // 创建场景和相机
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f0f0);
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(5, 5, 5);

    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 10, 10);
    this.scene.add(directionalLight);

    // 监听窗口调整大小
    window.addEventListener("resize", this.onWindowResize.bind(this));
  }

  setupScene() {
    // 创建场景和相机
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f0f0);

    // 添加网格辅助线
    const gridHelper = new THREE.GridHelper(10, 10);
    this.scene.add(gridHelper);

    // 添加坐标轴辅助线
    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
  }

  setupMeasurementTool() {
    this.measurementTool = new MeasurementTool(
      this.scene,
      this.camera,
      this.renderer
    );
  }

  setupGUI() {
    const gui = new GUI();
    const measureFolder = gui.addFolder("测量工具");

    measureFolder
      .add(this.measurementTool, "enabled")
      .name("启用测量")
      .onChange((value) => {
        document.getElementById("mode").textContent = `当前模式: ${
          value ? "测量" : "查看"
        }`;
      });

    measureFolder
      .add(this.measurementTool, "clearMeasurements")
      .name("清除测量");

    measureFolder
      .add(this.measurementTool, "showModelDimensions")
      .name("显示模型尺寸")
      .onChange(() => {
        this.measurementTool.updateModelDimensionsVisibility();
      });

    // 添加模型加载按钮
    measureFolder
      .add({ loadModel: () => this.loadModel() }, "loadModel")
      .name("加载模型");

    // 添加文件上传按钮
    measureFolder
      .add(
        {
          uploadModel: () => {
            document.getElementById("model-input").click();
          },
        },
        "uploadModel"
      )
      .name("上传模型");

    // 添加尺寸信息面板
    const dimensionsFolder = gui.addFolder("模型尺寸");
    const dimensions = { width: 0, height: 0, depth: 0 };

    dimensionsFolder.add(dimensions, "width").name("宽度").listen();
    dimensionsFolder.add(dimensions, "height").name("高度").listen();
    dimensionsFolder.add(dimensions, "depth").name("深度").listen();

    // 在加载模型后更新尺寸
    this.updateDimensions = (model) => {
      const size = this.measurementTool.getModelDimensions(model);
      dimensions.width = parseFloat(size.width.toFixed(3));
      dimensions.height = parseFloat(size.height.toFixed(3));
      dimensions.depth = parseFloat(size.depth.toFixed(3));
    };
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  async loadModel(url = "./models/matilda.glb") {
    const modelLoader = new ModelLoader(this.scene);
    try {
      // 移除示例立方体
      if (this.model) {
        this.scene.remove(this.model);
      }

      // 加载你的模型（替换为你的模型URL）
      const model = await modelLoader.loadModel(url);
      this.model = model;
      console.log(this.model);

      // 更新测量工具
      this.measurementTool.measureModel(model);

      // 更新GUI中的尺寸信息
      if (this.updateDimensions) {
        this.updateDimensions(model);
      }
    } catch (error) {
      console.error("模型加载失败:", error);
    }
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.controls.update();
    this.measurementTool.update();
    this.renderer.render(this.scene, this.camera);
  }

  setupFileInput() {
    const input = document.getElementById("model-input");
    input.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (file) {
        const url = URL.createObjectURL(file);
        await this.loadModel(url);
        URL.revokeObjectURL(url);
      }
    });
  }
}

// 创建应用实例
new App();
