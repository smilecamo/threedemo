import { SecureBusinessLogic } from "./secure";

// 初始化安全实例
const secureLogic = new SecureBusinessLogic();

// 添加一些基本的防护措施
function initSecurityMeasures() {
  // 禁用右键菜单
  document.addEventListener("contextmenu", (e) => e.preventDefault());

  // 禁用开发者工具快捷键
  document.addEventListener("keydown", (e) => {
    if (
      e.ctrlKey &&
      e.shiftKey &&
      (e.key === "I" || e.key === "J" || e.key === "C")
    ) {
      e.preventDefault();
    }
  });
}

// 测试加密逻辑
function testSecureLogic() {
  const result = secureLogic.calculateSensitiveData(100);
  console.log("计算结果:", result);

  const isValid = secureLogic.validateAccess("测试密钥");
  console.log("验证结果:", isValid);
}

// 初始化应用
document.addEventListener("DOMContentLoaded", () => {
  initSecurityMeasures();
  testSecureLogic();
});
