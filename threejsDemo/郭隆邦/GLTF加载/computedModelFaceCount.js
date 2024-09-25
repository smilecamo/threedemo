/**
 * 计算模型中所有网格对象的面的数量。
 *
 * @param {THREE.Object3D} computedModel - 要计算的模型对象。
 * @returns {Promise<number>} - 一个包含面的数量的 Promise 对象。
 */
export function computedFaceCount(computedModel) {
  return new Promise((resolve, reject) => {
    let faceCount = 0;

    // 遍历模型及其子对象
    computedModel.traverse(function (node) {
      // 仅处理网格对象
      if (node.isMesh) {
        const geometry = node.geometry;

        // 如果几何体具有索引属性
        if (geometry.index) {
          // 计算面的数量
          // geometry.index.count 是索引数组的长度
          // 每个面由3个顶点索引组成，因此除以3得到面的数量
          faceCount += geometry.index.count / 3;
        } else {
          // 如果几何体没有索引属性
          // geometry.attributes.position.count 是位置属性数组的长度
          // 每个顶点有3个坐标，因此除以3得到顶点的数量
          // 每个面由3个顶点组成，因此再除以3得到面的数量
          faceCount += geometry.attributes.position.count / 3;
        }
      }
    });
    console.log("模型的面数:" + faceCount);
    // 解析 Promise 并返回计算得到的面的数量
    resolve(faceCount);
  });
}
