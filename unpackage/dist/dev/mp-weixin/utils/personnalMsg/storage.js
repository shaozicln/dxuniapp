"use strict";
const common_vendor = require("../../common/vendor.js");
const storageUtil = {
  saveUserInfo(userInfo) {
    try {
      const oldInfo = this.getUserInfo() || {};
      const newInfo = { ...oldInfo, ...userInfo };
      common_vendor.index.setStorageSync("userInfo", newInfo);
      common_vendor.index.__f__("log", "at utils/personnalMsg/storage.js:8", "storageUtil: 用户信息保存成功", newInfo);
      return true;
    } catch (err) {
      common_vendor.index.__f__("error", "at utils/personnalMsg/storage.js:11", "storageUtil: 保存用户信息失败", err);
      common_vendor.index.showToast({ title: "保存失败，请重试", icon: "none" });
      return false;
    }
  },
  //从本地存储读取用户信息
  getUserInfo() {
    try {
      return common_vendor.index.getStorageSync("userInfo") || null;
    } catch (err) {
      common_vendor.index.__f__("error", "at utils/personnalMsg/storage.js:21", "storageUtil: 读取用户信息失败", err);
      return null;
    }
  }
};
exports.storageUtil = storageUtil;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/utils/personnalMsg/storage.js.map
