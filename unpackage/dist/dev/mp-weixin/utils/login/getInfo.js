"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request_request = require("../request/request.js");
const getInfo = {
  // 登出清理方法：补充清理 userInfo 中的身份信息，确保状态彻底重置
  _clearLoginState(redirectCb) {
    common_vendor.index.removeStorageSync("autoToken");
    common_vendor.index.removeStorageSync("token");
    common_vendor.index.removeStorageSync("userIdentity");
    const existingUserInfo = common_vendor.index.getStorageSync("userInfo") || {};
    if (existingUserInfo.userIdentity) {
      delete existingUserInfo.userIdentity;
      common_vendor.index.setStorageSync("userInfo", existingUserInfo);
    }
    common_vendor.index.removeStorageSync("isLogin");
    redirectCb && redirectCb();
  },
  async _handleGetInfoRequest(redirectCb) {
    try {
      const token = common_vendor.index.getStorageSync("autoToken") || common_vendor.index.getStorageSync("token");
      if (!token) {
        common_vendor.index.__f__("warn", "at utils/login/getInfo.js:22", "getInfo: 本地无有效Token，需重新登录");
        this._clearLoginState(redirectCb);
        return;
      }
      const res = await utils_request_request.get(
        "https://jxpj.neau.edu.cn/api/v1/getInfo",
        { headers: { "Authorization": `${token}` } }
      );
      if (!res || typeof res.code === "undefined") {
        common_vendor.index.__f__("error", "at utils/login/getInfo.js:35", "getInfo: 接口返回格式异常", res);
        common_vendor.index.showToast({ title: "获取身份信息失败：接口格式错误", icon: "none", duration: 2e3 });
        return;
      }
      if (res.code === 200) {
        if (!Array.isArray(res.roles) || res.roles.length === 0) {
          common_vendor.index.__f__("error", "at utils/login/getInfo.js:43", "getInfo: 角色信息缺失或格式错误", res);
          common_vendor.index.showToast({ title: "获取身份信息失败：角色数据无效", icon: "none", duration: 2e3 });
          this._clearLoginState(redirectCb);
          return;
        }
        let userIdentity = "";
        if (res.roles.includes("leader")) {
          userIdentity = "领导";
        } else if (res.roles.includes("supervisor")) {
          userIdentity = "督导";
        } else if (res.roles.includes("teacher")) {
          userIdentity = "教师";
        } else if (res.roles.includes("student")) {
          userIdentity = "学生";
        } else {
          common_vendor.index.__f__("warn", "at utils/login/getInfo.js:58", "getInfo: 不支持的用户角色", res.roles);
          common_vendor.index.showToast({ title: "当前身份不允许登录", icon: "none", duration: 2e3 });
          this._clearLoginState(redirectCb);
          return;
        }
        const existingUserInfo = common_vendor.index.getStorageSync("userInfo") || {};
        const updatedUserInfo = {
          ...existingUserInfo,
          userIdentity,
          roles: res.roles
        };
        common_vendor.index.setStorageSync("userInfo", updatedUserInfo);
        common_vendor.index.setStorageSync("isLogin", true);
        common_vendor.index.setStorageSync("userIdentity", userIdentity);
        common_vendor.index.__f__("log", "at utils/login/getInfo.js:73", "getInfo: 身份信息获取成功", { userIdentity, updatedUserInfo });
      } else {
        common_vendor.index.__f__("warn", "at utils/login/getInfo.js:76", "getInfo: 获取身份信息失败", { code: res.code, msg: res.msg });
        common_vendor.index.showToast({
          title: res.msg || `获取失败（错误码：${res.code}）`,
          icon: "none",
          duration: 2e3
        });
        if (res.code === 401) {
          this._clearLoginState(redirectCb);
        }
      }
    } catch (err) {
      common_vendor.index.__f__("error", "at utils/login/getInfo.js:90", "getInfo文件下的_handleGetInfoRequest代码出现问题: 向后端getinfo接口发送请求接收异常", { errMsg: err.message, stack: err.stack });
      common_vendor.index.showToast({ title: "网络异常，无法获取身份信息", icon: "none", duration: 2e3 });
    }
  }
};
exports.getInfo = getInfo;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/utils/login/getInfo.js.map
