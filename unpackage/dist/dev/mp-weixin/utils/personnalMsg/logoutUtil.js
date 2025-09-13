"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request_request = require("../request/request.js");
const logoutUtil = {
  async doLogout(redirectCb) {
    common_vendor.index.showModal({
      title: "确认退出",
      content: "退出后需重新登录，是否继续？",
      confirmText: "退出",
      cancelText: "取消",
      success: async (res) => {
        if (res.confirm) {
          await this._handleLogoutRequest(redirectCb);
        }
      }
    });
  },
  async _handleLogoutRequest(redirectCb) {
    try {
      const token = common_vendor.index.getStorageSync("autoToken") || common_vendor.index.getStorageSync("token");
      if (!token) {
        common_vendor.index.__f__("warn", "at utils/personnalMsg/logoutUtil.js:23", "logoutUtil: 本地无有效Token，直接清除状态");
        this._clearLoginState(redirectCb);
        return;
      }
      const res = await utils_request_request.post(
        "https://jxpj.neau.edu.cn/api/v1/logout",
        {},
        { headers: { "Authorization": `Bearer ${token}` } }
      );
      if ((res == null ? void 0 : res.code) === 200) {
        common_vendor.index.__f__("log", "at utils/personnalMsg/logoutUtil.js:36", "logoutUtil: 后端退出成功");
        common_vendor.index.showToast({ title: "已退出登录", icon: "none", duration: 500 });
        this._clearLoginState(redirectCb);
      } else {
        common_vendor.index.__f__("error", "at utils/personnalMsg/logoutUtil.js:40", "logoutUtil: 后端退出失败", res);
        common_vendor.index.showToast({ title: "退出失败，请重试", icon: "none" });
      }
    } catch (err) {
      common_vendor.index.__f__("error", "at utils/personnalMsg/logoutUtil.js:44", "logoutUtil: 退出请求异常", err);
      common_vendor.index.showToast({ title: "网络异常，已强制退出", icon: "none" });
      this._clearLoginState(redirectCb);
    }
  },
  _clearLoginState(redirectCb) {
    try {
      common_vendor.index.removeStorageSync("autoToken");
      common_vendor.index.removeStorageSync("token");
      common_vendor.index.removeStorageSync("userInfo");
      common_vendor.index.removeStorageSync("isLogin");
      common_vendor.index.removeStorageSync("userID");
    } catch (err) {
      common_vendor.index.__f__("error", "at utils/personnalMsg/logoutUtil.js:58", "logoutUtil: 清除状态失败", err);
    }
    if (typeof redirectCb === "function") {
      redirectCb();
    } else {
      setTimeout(() => common_vendor.index.redirectTo({ url: "/pages/login/login" }), 3e3);
    }
  }
};
exports.logoutUtil = logoutUtil;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/utils/personnalMsg/logoutUtil.js.map
