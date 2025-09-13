"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_login_msgUtil = require("../../utils/login/msgUtil.js");
const utils_login_flowUtil = require("../../utils/login/flowUtil.js");
const utils_login_storageUtil = require("../../utils/login/storageUtil.js");
const utils_login_getInfo = require("../../utils/login/getInfo.js");
const _sfc_main = {
  data() {
    common_vendor.index.__f__("log", "at pages/login/login.vue:43", "登录页组件初始化 - data数据初始化完成");
    return {
      showLoginForm: false,
      form: {
        userID: "",
        name: ""
      },
      msg: "",
      msgType: "",
      isLoading: false,
      msgTimer: null
    };
  },
  onLoad() {
    common_vendor.index.__f__("log", "at pages/login/login.vue:58", "登录页onLoad生命周期触发 - 开始执行初始化逻辑");
    this.initLoginFlow();
  },
  methods: {
    async initLoginFlow() {
      common_vendor.index.__f__("log", "at pages/login/login.vue:64", "进入initLoginFlow - 启动自动登录流程");
      this.isLoading = true;
      try {
        const wxCode = await utils_login_flowUtil.loginFlowUtil.getWxCode();
        common_vendor.index.__f__("log", "at pages/login/login.vue:68", "自动获取微信code成功:", wxCode);
        const {
          autoLoginRes,
          userID
        } = await utils_login_flowUtil.loginFlowUtil.autoLogin(wxCode);
        if ((autoLoginRes == null ? void 0 : autoLoginRes.token) && userID) {
          common_vendor.index.__f__("log", "at pages/login/login.vue:76", "后端获取成功，成功获取到用户信息", {
            token: autoLoginRes.token
          });
          const userInfo = utils_login_storageUtil.loginStorageUtil.buildUserInfo(
            userID,
            autoLoginRes.name,
            autoLoginRes.token
          );
          utils_login_storageUtil.loginStorageUtil.saveAutoLoginData(autoLoginRes.token, userInfo);
          common_vendor.index.__f__("log", "at pages/login/login.vue:86", "自动登录成功，开始获取用户身份信息");
          await utils_login_getInfo.getInfo._handleGetInfoRequest(() => {
            this.showLoginForm = true;
            utils_login_msgUtil.loginMsgUtil.showMsg(this, "身份验证失败，请重新登录", "error");
          });
          utils_login_msgUtil.loginMsgUtil.showMsg(this, "自动登录成功，正在跳转", "success");
        } else if (autoLoginRes == null ? void 0 : autoLoginRes.token) {
          common_vendor.index.__f__("log", "at pages/login/login.vue:94", "自动登录仅获取到token，缺少用户信息");
          utils_login_storageUtil.loginStorageUtil.saveAutoLoginData(autoLoginRes.token);
          utils_login_msgUtil.loginMsgUtil.showMsg(this, "需补充用户信息，请手动登录", "error");
        } else {
          common_vendor.index.__f__("log", "at pages/login/login.vue:98", "自动登录失败，未获取到有效token");
          utils_login_msgUtil.loginMsgUtil.showMsg(this, "自动登录失败，请手动登录", "error");
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:103", "自动登录流程异常:", {
          errMsg: err.message,
          stack: err.stack
        });
        utils_login_msgUtil.loginMsgUtil.showMsg(this, `自动登录失败: ${err.message || "网络异常"}`, "error");
      } finally {
        await this.checkLocalToken();
        this.isLoading = false;
        common_vendor.index.__f__("log", "at pages/login/login.vue:111", "自动登录流程结束，已执行本地Token校验");
      }
    },
    async checkLocalToken() {
      var _a;
      common_vendor.index.__f__("log", "at pages/login/login.vue:116", "进入checkLocalToken - 校验本地登录状态");
      this.isLoading = true;
      try {
        const {
          localAutoToken,
          localManualToken,
          localUser
        } = utils_login_storageUtil.loginStorageUtil.getLocalLoginData();
        common_vendor.index.__f__("log", "at pages/login/login.vue:124", "本地存储数据校验:", {
          hasAutoToken: !!localAutoToken,
          hasManualToken: !!localManualToken,
          hasUserInfo: !!localUser,
          userID: (localUser == null ? void 0 : localUser.userID) || "无",
          userIdentity: (localUser == null ? void 0 : localUser.userIdentity) || "未获取"
        });
        let completeUser = {
          ...localUser
        };
        if (!completeUser.userIdentity) {
          completeUser.userIdentity = ((_a = completeUser.teacherID) == null ? void 0 : _a.startsWith("Z")) ? "教师" : completeUser.studentID ? "学生" : "未登录";
          common_vendor.index.setStorageSync("userInfo", completeUser);
        }
        const hasValidToken = localAutoToken || localManualToken;
        const hasCompleteUser = (completeUser == null ? void 0 : completeUser.userID) && (completeUser == null ? void 0 : completeUser.userIdentity);
        if (hasValidToken && hasCompleteUser) {
          common_vendor.index.__f__("log", "at pages/login/login.vue:145", "本地登录状态有效，跳转首页", {
            userIdentity: completeUser.userIdentity
          });
          setTimeout(() => {
            common_vendor.index.setStorageSync("isLogin", true);
            common_vendor.index.switchTab({
              url: "/pages/index/index"
            });
          }, 1e3);
        } else {
          common_vendor.index.__f__("log", "at pages/login/login.vue:155", "本地登录状态无效（缺Token或身份），显示登录表单");
          this.showLoginForm = true;
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:160", "本地Token校验异常:", {
          errMsg: err.message,
          stack: err.stack
        });
        utils_login_msgUtil.loginMsgUtil.showMsg(this, "登录状态校验失败，请重试", "error");
        this.showLoginForm = true;
      } finally {
        this.isLoading = false;
        common_vendor.index.__f__("log", "at pages/login/login.vue:168", "localToken校验流程结束");
      }
    },
    async handleLogin() {
      common_vendor.index.__f__("log", "at pages/login/login.vue:173", "进入handleLogin - 执行手动登录");
      this.isLoading = true;
      try {
        const {
          trimmedUserID,
          trimmedName
        } = utils_login_flowUtil.loginFlowUtil.validateInput(
          this.form.userID,
          this.form.name
        );
        const wxCode = await utils_login_flowUtil.loginFlowUtil.getWxCode();
        const loginRes = await utils_login_flowUtil.loginFlowUtil.manualLogin(wxCode, trimmedUserID);
        if (loginRes == null ? void 0 : loginRes.token) {
          common_vendor.index.__f__("log", "at pages/login/login.vue:188", "手动登录成功，获取到token:", loginRes.token);
          const userInfo = utils_login_storageUtil.loginStorageUtil.buildUserInfo(
            trimmedUserID,
            trimmedName,
            loginRes.token,
            ""
          );
          utils_login_storageUtil.loginStorageUtil.saveManualLoginData(loginRes.token, userInfo);
          common_vendor.index.__f__("log", "at pages/login/login.vue:197", "手动登录成功，开始获取用户身份信息");
          await utils_login_getInfo.getInfo._handleGetInfoRequest(() => {
            this.showLoginForm = true;
            utils_login_msgUtil.loginMsgUtil.showMsg(this, "身份验证失败，请重新登录", "error");
          });
          utils_login_msgUtil.loginMsgUtil.showMsg(this, "登录成功，正在跳转", "success");
          setTimeout(() => {
            common_vendor.index.switchTab({
              url: "/pages/index/index"
            });
          }, 1e3);
        } else {
          throw new Error((loginRes == null ? void 0 : loginRes.msg) || "登录失败，请检查账号信息是否正确");
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:214", "手动登录异常:", {
          errMsg: err.message,
          stack: err.stack
        });
        utils_login_msgUtil.loginMsgUtil.showMsg(this, err.message || "登录异常，请重试", "error");
      } finally {
        this.isLoading = false;
      }
    }
  },
  onUnload() {
    common_vendor.index.__f__("log", "at pages/login/login.vue:226", "登录页onUnload生命周期触发");
    utils_login_msgUtil.loginMsgUtil.clearMsgTimer(this);
  }
};
if (!Array) {
  const _component_uni_loading = common_vendor.resolveComponent("uni-loading");
  _component_uni_loading();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.showLoginForm
  }, $data.showLoginForm ? {
    b: common_vendor.t($data.form.userID ? "欢迎回来" : "请登录"),
    c: common_vendor.o(($event) => $data.form.userID = $event.detail.value.trim()),
    d: $data.form.userID,
    e: $data.isLoading,
    f: common_vendor.o(($event) => $data.form.name = $event.detail.value.trim()),
    g: $data.form.name,
    h: $data.isLoading,
    i: common_vendor.t($data.isLoading ? "登录中..." : "请点击登录"),
    j: common_vendor.o((...args) => $options.handleLogin && $options.handleLogin(...args)),
    k: !$data.form.userID || !$data.form.name || $data.isLoading
  } : {}, {
    l: $data.isLoading && !$data.showLoginForm
  }, $data.isLoading && !$data.showLoginForm ? {
    m: common_vendor.p({
      type: "spin",
      size: "36"
    })
  } : {}, {
    n: $data.msg
  }, $data.msg ? {
    o: common_vendor.t($data.msg),
    p: common_vendor.n($data.msgType === "error" ? "error-msg" : "success-msg")
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-e4e4508d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
