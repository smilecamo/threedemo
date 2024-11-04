/**
 * 处理模型点击事件的主函数
 * @param {MouseEvent} event - 鼠标点击事件对象
 */
export function onModelClick(event) {
  // 将鼠标点击位置转换为标准化设备坐标(范围从-1到1)
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1; // 转换X坐标
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1; // 转换Y坐标并翻转

  // 创建射线投射器并设置射线起点和方向
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  // 检测射线与模型的交点
  const intersects = raycaster.intersectObject(object, true);

  if (intersects.length > 0) {
    const intersection = intersects[0];
    const point = intersection.point; // 获取交点坐标

    // 计算相机到交点的方向向量并归一化
    const cameraDirection = new THREE.Vector3();
    cameraDirection.subVectors(camera.position, point).normalize();

    // 获取相机的上方向和右方向向量
    const cameraUp = camera.up.clone();
    const cameraRight = new THREE.Vector3();
    cameraRight.crossVectors(cameraDirection, cameraUp);

    // 获取交点的法线并转换到世界坐标系
    const normal = intersection.face.normal.clone();
    normal.transformDirection(intersection.object.matrixWorld);

    // 计算视角(相机方向与表面法线的夹角)
    const viewAngle = THREE.MathUtils.radToDeg(
      Math.acos(Math.abs(normal.dot(cameraDirection)))
    );

    // 计算方位角(法线在相机上-右平面的投影角度)
    const azimuthAngle = THREE.MathUtils.radToDeg(
      Math.atan2(normal.dot(cameraRight), normal.dot(cameraUp))
    );

    // 创建临时渲染目标用于像素采样
    const pixelBuffer = new THREE.WebGLRenderTarget(
      window.innerWidth * window.devicePixelRatio,
      window.innerHeight * window.devicePixelRatio,
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.UnsignedByteType,
      }
    );

    try {
      // 将场景渲染到临时缓冲区
      const originalRenderTarget = renderer.getRenderTarget();
      renderer.setRenderTarget(pixelBuffer);
      renderer.render(scene, camera);

      // 计算点击位置对应的像素坐标
      const pixelX = Math.floor(event.clientX * window.devicePixelRatio);
      const pixelY = Math.floor(
        (window.innerHeight - event.clientY) * window.devicePixelRatio
      );

      // 定义采样参数
      const sampleSize = 3; // 采样区域大小(3x3)
      const halfSize = Math.floor(sampleSize / 2);
      const samples = []; // 存储采样结果
      const weights = []; // 存储每个采样点的权重

      // 对周围区域进行颜色采样
      for (let offsetY = -halfSize; offsetY <= halfSize; offsetY++) {
        for (let offsetX = -halfSize; offsetX <= halfSize; offsetX++) {
          const currentX = pixelX + offsetX;
          const currentY = pixelY + offsetY;

          // 确保采样点在渲染目标范围内
          if (
            currentX >= 0 &&
            currentX < pixelBuffer.width &&
            currentY >= 0 &&
            currentY < pixelBuffer.height
          ) {
            const buffer = new Uint8Array(4);
            // 读取像素颜色
            renderer.readRenderTargetPixels(
              pixelBuffer,
              currentX,
              currentY,
              1,
              1,
              buffer
            );

            // 基于距离计算权重(距离越远权重越小)
            const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
            const weight = 1 / (1 + distance);

            samples.push({
              color: [buffer[0], buffer[1], buffer[2]],
              weight: weight,
            });
            weights.push(weight);
          }
        }
      }

      // 恢复原始渲染目标
      renderer.setRenderTarget(originalRenderTarget);

      // 计算加权平均颜色
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);
      const averageColor = [0, 0, 0];

      // 对每个采样点的颜色进行加权
      samples.forEach((sample, index) => {
        const normalizedWeight = weights[index] / totalWeight;
        averageColor[0] += sample.color[0] * normalizedWeight;
        averageColor[1] += sample.color[1] * normalizedWeight;
        averageColor[2] += sample.color[2] * normalizedWeight;
      });

      const finalColor = averageColor.map((v) => Math.round(v));

      // 计算颜色方差(用于评估采样区域的颜色一致性)
      const colorVariance =
        samples.reduce((variance, sample) => {
          return (
            variance +
            Math.pow(
              Math.abs(sample.color[0] - finalColor[0]) +
                Math.abs(sample.color[1] - finalColor[1]) +
                Math.abs(sample.color[2] - finalColor[2]),
              2
            )
          );
        }, 0) / samples.length;

      // 基于颜色方差计算一致性分数(0-100)
      const consistencyScore = Math.max(0, 100 - colorVariance / 50);

      // 基于视角计算颜色修正系数
      const MIN_ANGLE = 20;
      const MAX_ANGLE = 160;
      let colorCorrectionFactor = 1.0;

      // 在极端视角下降低可靠性
      if (viewAngle < MIN_ANGLE || viewAngle > MAX_ANGLE) {
        colorCorrectionFactor = 0.5;
      } else {
        // 使用正弦函数调整修正系数
        colorCorrectionFactor = Math.sin(THREE.MathUtils.degToRad(viewAngle));
      }

      // 应用视角修正到最终颜色
      const correctedColor = finalColor.map((value) =>
        Math.min(255, Math.round(value / colorCorrectionFactor))
      );

      // 显示采样结果
      showIntensityLabel(event.clientX, event.clientY, {
        rgb: correctedColor,
        originalRgb: finalColor,
        // 计算灰度值(使用标准RGB转灰度公式)
        grayscale: Math.round(
          0.299 * correctedColor[0] +
            0.587 * correctedColor[1] +
            0.114 * correctedColor[2]
        ),
        viewAngle: viewAngle.toFixed(1),
        azimuthAngle: azimuthAngle.toFixed(1),
        reliability: (colorCorrectionFactor * 100).toFixed(0),
        consistency: consistencyScore.toFixed(0),
        sampleCount: samples.length,
      });
    } catch (error) {
      console.error("Error sampling render target:", error);
    } finally {
      // 清理临时渲染目标
      pixelBuffer.dispose();
    }
  }
}

/**
 * 显示颜色采样结果的标签
 * @param {number} x - 标签X坐标
 * @param {number} y - 标签Y坐标
 * @param {Object} data - 采样数据
 */
export function showIntensityLabel(x, y, data) {
  // 移除已存在的标签
  const existingLabel = document.getElementById("intensityLabel");
  if (existingLabel) {
    existingLabel.remove();
  }

  // 创建新标签元素
  const label = document.createElement("div");
  label.id = "intensityLabel";
  // 设置标签样式
  label.style.position = "fixed";
  label.style.left = `${x + 10}px`;
  label.style.top = `${y + 10}px`;
  label.style.background = "rgba(0, 0, 0, 0.8)";
  label.style.color = "#fff";
  label.style.padding = "10px";
  label.style.borderRadius = "5px";
  label.style.fontSize = "14px";
  label.style.zIndex = "1000";
  label.style.fontFamily = "monospace";
  label.style.backdropFilter = "blur(4px)";
  label.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";

  // 创建颜色预览HTML
  const colorPreview = `
        <div style="display: flex; gap: 5px; margin-bottom: 8px;">
            <div style="
                width: 20px;
                height: 20px;
                background: rgb(${data.rgb.join(",")});
                border: 1px solid #fff;
                box-shadow: 0 0 5px rgba(0,0,0,0.5);
            "></div>
            <div style="
                width: 20px;
                height: 20px;
                background: rgb(${data.originalRgb.join(",")});
                border: 1px solid #fff;
                box-shadow: 0 0 5px rgba(0,0,0,0.5);
                opacity: 0.5;
            "></div>
        </div>
    `;

  // 根据可靠性分数选择指示器颜色
  const reliabilityColor =
    data.reliability > 80
      ? "#4CAF50" // 高可靠性显示绿色
      : data.reliability > 50
      ? "#FFC107" // 中等可靠性显示黄色
      : "#F44336"; // 低可靠性显示红色

  // 创建可靠性指示器HTML
  const reliabilityIndicator = `
        <div style="margin: 5px 0;">
            <div style="
                width: 100%;
                height: 4px;
                background: #333;
                border-radius: 2px;
                overflow: hidden;
            ">
                <div style="
                    width: ${data.reliability}%;
                    height: 100%;
                    background: ${reliabilityColor};
                    transition: width 0.3s ease;
                "></div>
            </div>
        </div>
    `;

  // 根据一致性分数选择指示器颜色
  const consistencyColor =
    data.consistency > 80
      ? "#4CAF50" // 高一致性显示绿色
      : data.consistency > 60
      ? "#FFC107" // 中等一致性显示黄色
      : "#F44336"; // 低一致性显示红色

  // 创建一致性指示器HTML
  const consistencyIndicator = `
        <div style="margin: 5px 0;">
            <div style="
                width: 100%;
                height: 4px;
                background: #333;
                border-radius: 2px;
                overflow: hidden;
            ">
                <div style="
                    width: ${data.consistency}%;
                    height: 100%;
                    background: ${consistencyColor};
                    transition: width 0.3s ease;
                "></div>
            </div>
        </div>
    `;

  // 组装完整的标签内容
  label.innerHTML = `
        ${colorPreview}
        <div style="line-height: 1.5;">
            修正后RGB: (${data.rgb.join(", ")})<br>
            原始RGB: (${data.originalRgb.join(", ")})<br>
            灰度值: ${data.grayscale}<br>
            视角: ${data.viewAngle}°<br>
            方位角: ${data.azimuthAngle}°<br>
            采样点数: ${data.sampleCount}<br>
            ${reliabilityIndicator}
            <small>采样可靠度: ${data.reliability}%</small>
            ${consistencyIndicator}
            <small>区域一致性: ${data.consistency}%</small>
            ${
              data.consistency < 60
                ? '<br><small style="color: #FFC107;">⚠️ 区域颜色差异较大</small>'
                : ""
            }
            ${
              data.reliability < 50
                ? '<br><small style="color: #F44336;">⚠️ 视角不佳,数据可能不准确</small>'
                : ""
            }
        </div>
    `;

  // 将标签添加到页面
  document.body.appendChild(label);

  // 添加淡出动画效果
  label.style.transition = "opacity 0.3s ease-in-out";
  setTimeout(() => {
    label.style.opacity = "0";
    setTimeout(() => label.remove(), 300); // 动画结束后移除标签
  }, 4700);
}
