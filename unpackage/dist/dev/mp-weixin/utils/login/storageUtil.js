"use strict";
const common_vendor = require("../../common/vendor.js");
const loginStorageUtil = {
  buildUserInfo(userID, name, token) {
    return {
      userID,
      name: name || "未设置",
      teacherID: userID.startsWith("Z") ? userID : "",
      studentID: userID.startsWith("Z") ? "" : userID,
      loginTime: (/* @__PURE__ */ new Date()).toLocaleString(),
      token
    };
  },
  //存储自动登录数据到本地
  saveAutoLoginData(token, userInfo = null) {
    common_vendor.index.setStorageSync("autoToken", token);
    if (userInfo) {
      common_vendor.index.setStorageSync("userInfo", userInfo);
    }
  },
  //存储手动登录数据到本地
  saveManualLoginData(token, userInfo) {
    common_vendor.index.setStorageSync("token", token);
    common_vendor.index.setStorageSync("userInfo", userInfo);
    common_vendor.index.setStorageSync("isLogin", true);
  },
  //获取本地存储的登录数据
  getLocalLoginData() {
    return {
      localAutoToken: common_vendor.index.getStorageSync("autoToken"),
      localManualToken: common_vendor.index.getStorageSync("token"),
      localUser: common_vendor.index.getStorageSync("userInfo")
    };
  },
  completeUserIdentity(localUser) {
    if ((localUser == null ? void 0 : localUser.userID) && !localUser.teacherID && !localUser.studentID) {
      common_vendor.index.__f__("log", "at utils/login/storageUtil.js:36", "补全本地用户身份字段（teacherID/studentID）");
      return {
        ...localUser,
        teacherID: localUser.userID.startsWith("Z") ? localUser.userID : "",
        studentID: localUser.userID.startsWith("Z") ? "" : localUser.userID
      };
    }
    return localUser;
  }
};
exports.loginStorageUtil = loginStorageUtil;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/utils/login/storageUtil.js.map
