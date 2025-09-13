"use strict";
const common_vendor = require("../../common/vendor.js");
const errorHandler = {
  /**
   * 处理用户信息初始化错误
   * @param {Object} userInfo - 用户信息对象
   * @param {Error} err - 错误对象
   * @param {Function} navigateToLogin - 跳转到登录页的函数
   */
  handleUserInitError(userInfo, err, navigateToLogin) {
    common_vendor.index.__f__("error", "at utils/my/errorHandler.js:10", "用户信息初始化异常：", err.message || err);
    userInfo.identity = "未登录";
    common_vendor.index.showToast({
      title: "身份加载失败，请重新登录",
      icon: "none",
      duration: 3e3,
      mask: true
    });
    setTimeout(navigateToLogin, 3e3);
  },
  /**
   * 处理头像加载错误
   * @param {Event} e - 事件对象
   */
  handleAvatarError(e) {
    e.currentTarget.src = "/static/default-avatar.png";
  }
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/utils/my/errorHandler.js.map
