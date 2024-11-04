import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export class ModelLoader {
  constructor(scene) {
    this.scene = scene;
    this.setupLoaders();
  }

  setupLoaders() {
    // 只初始化 GLTF 加载器
    this.gltfLoader = new GLTFLoader();
  }

  async loadModel(url) {
    try {
      const gltf = await this.loadGLTF(url);
      const model = gltf.scene;

      // 自动调整模型位置和大小
      this.centerAndScaleModel(model);

      this.scene.add(model);
      return model;
    } catch (error) {
      console.error("模型加载失败:", error);
      throw error;
    }
  }

  loadGLTF(url) {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        url,
        resolve,
        (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + "% 已加载");
        },
        reject
      );
    });
  }

  centerAndScaleModel(model) {
    // 计算原始包围盒
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = box.getCenter(new THREE.Vector3());

    // 存储原始尺寸
    model.userData.originalSize = {
      width: size.x,
      height: size.y,
      depth: size.z,
    };

    // 计算适当的缩放比例（使最大边长为5个单位）
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 5 / maxDim;

    // 存储缩放因子
    model.userData.scaleFactor = scale;

    // 应用缩放
    model.scale.multiplyScalar(scale);

    // 居中模型
    model.position.sub(center.multiplyScalar(scale));
  }
}
