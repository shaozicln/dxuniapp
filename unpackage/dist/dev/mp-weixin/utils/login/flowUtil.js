"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request_request = require("../request/request.js");
const loginFlowUtil = {
  // 获取微信登录code
  async getWxCode() {
    return new Promise((resolve, reject) => {
      common_vendor.index.login({
        provider: "weixin",
        success: (res) => {
          if (res.code)
            resolve(res.code);
          else
            reject(new Error(`获取微信code失败: ${res.errMsg}`));
        },
        fail: (err) => reject(new Error(`微信登录接口失败: ${err.errMsg}`))
      });
    });
  },
  // 自动登录流程（调用后端/loginByCode
  async autoLogin(wxCode) {
    common_vendor.index.__f__("log", "at utils/login/flowUtil.js:20", "调用后端/loginByCode接口，请求自动登录");
    const autoLoginRes = await utils_request_request.post("https://jxpj.neau.edu.cn/api/v1/loginByCode", {
      weixincode: wxCode
    });
    const userID = common_vendor.index.getStorageSync("userID") || "";
    return { autoLoginRes, userID };
  },
  // 手动登录流程（调用后端/login）
  async manualLogin(wxCode, userID) {
    common_vendor.index.__f__("log", "at utils/login/flowUtil.js:31", "调用后端/login接口，提交手动登录信息");
    return await utils_request_request.post("https://jxpj.neau.edu.cn/api/v1/login", {
      weixincode: wxCode,
      username: userID,
      password: userID
    });
  },
  validateInput(userID, name) {
    let trimmedUserID = userID.trim();
    const trimmedName = name.trim();
    if (!trimmedUserID || !trimmedName) {
      throw new Error("请输入完整的教工号/学工号和姓名");
    }
    if (/^[Aa]/.test(trimmedUserID)) {
      if (!/^[Aa]\d{8}$/.test(trimmedUserID)) {
        throw new Error("学工号格式错误（应为A/a+8位数字，如A19230111）");
      }
      trimmedUserID = "A" + trimmedUserID.slice(1).toUpperCase();
    } else if (/^[Zz]/.test(trimmedUserID)) {
      if (!/^[Zz]\d{5}$/.test(trimmedUserID)) {
        throw new Error("教工号格式错误（应为Z/z+5位数字，如Z10005）");
      }
      trimmedUserID = "Z" + trimmedUserID.slice(1).toUpperCase();
    } else {
      throw new Error("学工号应为A/a+8位数字，教工号应为Z/z+5位数字");
    }
    return { trimmedUserID, trimmedName };
  }
};
exports.loginFlowUtil = loginFlowUtil;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/utils/login/flowUtil.js.map
