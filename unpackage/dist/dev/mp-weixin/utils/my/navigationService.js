"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_navigate_navigate = require("../navigate/navigate.js");
const navigationService = {
  /**
   * 跳转到个人信息编辑页
   * @param {string} userRole - 用户角色
   * @param {Object} userInfo - 用户信息对象
   * @param {Array<string>} excludeFields - 需要排除的字段
   * @returns {Promise<void>}
   */
  async goToProfileEdit(userRole, userInfo, excludeFields = []) {
    if (userRole === "未登录") {
      this.showToast("请先登录再编辑信息");
      return;
    }
    try {
      const userInfoStr = this.serializeUserInfo(userInfo, excludeFields);
      const navigateOptions = {
        loadingText: "加载编辑页...",
        query: { userInfo: userInfoStr || "{}" },
        onError: (err) => {
          common_vendor.index.__f__("warn", "at utils/my/navigationService.js:25", "跳转编辑页异常：", err);
          this.showToast("跳转失败，请稍后重试");
        },
        success: () => {
          common_vendor.index.__f__("log", "at utils/my/navigationService.js:29", "跳转编辑页成功");
        }
      };
      await utils_navigate_navigate.navigateToWithLoading("/pages/personalMsg/personalMsg", navigateOptions);
    } catch (err) {
      common_vendor.index.__f__("error", "at utils/my/navigationService.js:35", "跳转编辑页失败：", err.message || err);
      this.showToast("系统异常，无法跳转");
    }
  },
  /**
   * 跳转到登录页
   * @param {string} message - 提示消息
   * @returns {Promise<void>}
   */
  async goToLogin(message = "身份加载失败，请重新登录") {
    this.showToast(message, { duration: 3e3 });
    await new Promise((resolve) => setTimeout(resolve, 3e3));
    common_vendor.index.showModal({
      title: "身份验证失败",
      content: "是否前往登录页？",
      showCancel: true,
      cancelText: "取消",
      confirmText: "去登录",
      mask: true,
      success: (res) => {
        if (res.confirm) {
          common_vendor.index.hideModal();
          utils_navigate_navigate.navigateToWithLoading("/pages/login/login");
        }
      }
    });
  },
  /**
   * 序列化用户信息
   * @param {Object} userInfo - 用户信息对象
   * @param {Array<string>} excludeFields - 需要排除的字段
   * @returns {string} 序列化后的字符串
   */
  serializeUserInfo(userInfo, excludeFields) {
    try {
      return JSON.stringify(userInfo, (key, value) => {
        return excludeFields.includes(key) ? void 0 : value;
      });
    } catch (stringifyErr) {
      throw new Error(`用户信息序列化失败：${stringifyErr.message}`);
    }
  },
  /**
   * 显示提示消息
   * @param {string} title - 消息内容
   * @param {Object} options - 配置选项
   */
  showToast(title, options = {}) {
    common_vendor.index.showToast({
      title,
      icon: options.icon || "none",
      duration: options.duration || 2e3,
      mask: options.mask || true,
      ...options
    });
  }
};
exports.navigationService = navigationService;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/utils/my/navigationService.js.map
