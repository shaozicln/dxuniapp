"use strict";
const common_vendor = require("../../common/vendor.js");
const userInfoManager = {
  /**
   * 初始化用户信息（核心修正：对齐 userInfoUtil 的身份判定逻辑）
   * @param {Object} reactiveUserInfo - 响应式用户信息对象
   * @returns {Promise<boolean>} 初始化是否成功
   */
  async initUserInfo(reactiveUserInfo) {
    try {
      if (typeof common_vendor.index === "undefined" || !common_vendor.index.getStorageSync || !common_vendor.index.showToast) {
        throw new Error("当前环境不支持UniApp核心API");
      }
      const storedUserInfo = common_vendor.index.getStorageSync("userInfo");
      common_vendor.index.__f__("log", "at utils/my/userInfoManager.js:16", "读取到的本地用户信息：", storedUserInfo);
      if (!storedUserInfo || typeof storedUserInfo !== "object" || Array.isArray(storedUserInfo)) {
        common_vendor.index.__f__("warn", "at utils/my/userInfoManager.js:20", "本地用户信息无效（非对象），使用默认值");
        return false;
      }
      this.mergeUserInfo(reactiveUserInfo, storedUserInfo);
      const derivedIdentity = this.deriveIdentity(storedUserInfo);
      reactiveUserInfo.identity = this.getValidIdentity(derivedIdentity);
      common_vendor.index.__f__("log", "at utils/my/userInfoManager.js:32", "初始化后用户身份：", reactiveUserInfo.identity);
      return true;
    } catch (err) {
      common_vendor.index.__f__("error", "at utils/my/userInfoManager.js:35", "用户信息初始化异常：", err.message || err);
      reactiveUserInfo.identity = "未登录";
      return false;
    }
  },
  /**
   * 合并用户信息（与 userInfoUtil 逻辑完全对齐：空值不覆盖）
   * @param {Object} target - 目标响应式对象
   * @param {Object} source - 源数据对象（本地存储的 userInfo）
   */
  mergeUserInfo(target, source) {
    Object.keys(target).forEach((key) => {
      if (source[key] !== void 0 && source[key] !== "" && source[key] !== null) {
        target[key] = source[key];
      }
    });
  },
  /**
   * 新增：按 userInfoUtil 规则推导身份（核心逻辑对齐）
   * @param {Object} storedUserInfo - 本地存储的用户信息
   * @returns {string} 推导后的身份（领导/督导/教师/学生/未登录）
   */
  deriveIdentity(storedUserInfo) {
    var _a;
    let identity = "未登录";
    if (typeof storedUserInfo.userIdentity === "string" && storedUserInfo.userIdentity.trim() !== "") {
      identity = storedUserInfo.userIdentity.trim();
    } else {
      if ((_a = storedUserInfo.teacherID) == null ? void 0 : _a.startsWith("Z")) {
        identity = "教师";
      } else if (storedUserInfo.studentID && storedUserInfo.studentID.trim() !== "") {
        identity = "学生";
      }
    }
    return identity;
  },
  /**
   * 获取有效的用户身份（保留原逻辑，已包含「领导/督导」，无需修改）
   * @param {string} identity - 推导后的身份标识
   * @returns {string} 有效身份（无效值默认转为「未登录」）
   */
  getValidIdentity(identity) {
    const validIdentities = ["领导", "督导", "教师", "学生", "未登录"];
    return validIdentities.includes((identity == null ? void 0 : identity.toString()) || "") ? identity : "未登录";
  },
  /**
   * 新增：对齐 userInfoUtil 的 getIDLabel 方法（获取身份对应的编号标签）
   * @param {string} identity - 用户身份（领导/督导/教师/学生）
   * @returns {string} 编号标签（如「教工号」「学号」）
   */
  getIDLabel(identity) {
    const labelMap = {
      "教师": "教工号",
      "学生": "学号",
      "领导": "教工号",
      // 与 userInfoUtil 一致
      "督导": "教工号"
      // 与 userInfoUtil 一致
    };
    return labelMap[identity] || "编号";
  },
  /**
   * 新增：对齐 userInfoUtil 的 getEditableFields 方法（获取可编辑字段）
   * @param {string} identity - 用户身份（领导/督导/教师/学生）
   * @returns {Array} 可编辑字段列表
   */
  getEditableFields(identity) {
    const baseFields = [
      { label: "性别", field: "gender", type: "select", options: ["男", "女", "保密"] },
      { label: "学院", field: "college", type: "input", placeholder: "请输入学院名称" }
    ];
    if (identity === "学生") {
      return [
        ...baseFields,
        { label: "班级", field: "className", type: "input", placeholder: "请输入班级（如计科2301）" },
        { label: "专业", field: "major", type: "input", placeholder: "请输入专业名称" }
      ];
    }
    return baseFields;
  }
};
exports.userInfoManager = userInfoManager;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/utils/my/userInfoManager.js.map
