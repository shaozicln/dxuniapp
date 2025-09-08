"use strict";
const common_vendor = require("../../common/vendor.js");
const src_utils_request_request = require("../../src/utils/request/request.js");
const _sfc_main = {
  data() {
    common_vendor.index.__f__("log", "at pages/login/login.vue:33", "登录页组件初始化 - data数据初始化完成");
    return {
      showLoginForm: false,
      // 是否显示登录表单
      form: {
        teacherId: "",
        // 教工号/学工号
        name: ""
        // 姓名
      },
      msg: "",
      // 提示消息
      msgType: "",
      // 消息类型：error/success
      isLoading: false,
      // 加载状态
      msgTimer: null
      // 消息定时器（防止重复触发）
    };
  },
  onLoad() {
    common_vendor.index.__f__("log", "at pages/login/login.vue:48", "登录页onLoad生命周期触发 - 开始执行初始化逻辑");
    this.initLoginFlow();
  },
  methods: {
    showMsg(message, type = "error") {
      common_vendor.index.__f__("log", "at pages/login/login.vue:55", `[消息提示] 类型: ${type}, 内容: ${message}`);
      if (this.msgTimer) {
        clearTimeout(this.msgTimer);
      }
      this.msg = message;
      this.msgType = type;
      this.msgTimer = setTimeout(() => {
        common_vendor.index.__f__("log", "at pages/login/login.vue:62", "消息提示自动关闭");
        this.msg = "";
      }, 5e3);
    },
    /**
     * 先自动调用微信登录获取code，请求后端/loginByCode获取token
     * 再校验本地Token，决定是否显示登录表单
     */
    async initLoginFlow() {
      common_vendor.index.__f__("log", "at pages/login/login.vue:72", "进入initLoginFlow - 启动自动登录流程（获取code+请求token）");
      this.isLoading = true;
      try {
        const wxLoginRes = await new Promise((resolve, reject) => {
          common_vendor.index.login({
            provider: "weixin",
            success: (res) => {
              if (res.code) {
                common_vendor.index.__f__("log", "at pages/login/login.vue:81", "自动获取微信code成功:", res.code);
                resolve(res.code);
              } else {
                reject(new Error(`自动获取code失败: ${res.errMsg}`));
              }
            },
            fail: (err) => {
              reject(new Error(`微信登录接口调用失败: ${err.errMsg}`));
            }
          });
        });
        common_vendor.index.__f__("log", "at pages/login/login.vue:94", "自动调用后端/loginByCode接口，传递code请求token");
        const autoLoginRes = await src_utils_request_request.post("http://localhost:8080/loginByCode", {
          weixincode: wxLoginRes
          // 传递自动获取的微信code
        });
        if (autoLoginRes == null ? void 0 : autoLoginRes.token) {
          common_vendor.index.__f__("log", "at pages/login/login.vue:102", "自动登录成功，获取到token:", autoLoginRes.token);
          common_vendor.index.setStorageSync("autoToken", autoLoginRes.token);
          this.showMsg("自动获取登录凭证成功", "success");
        } else {
          common_vendor.index.__f__("log", "at pages/login/login.vue:107", "自动登录未获取到有效token，需后续用户手动登录");
          this.showMsg("未获取到相关信息，请手动登录", "error");
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:112", "自动登录流程异常:", err);
        this.showMsg("自动登录失败，请重试", "error");
      } finally {
        await this.checkLocalToken();
        this.isLoading = false;
        common_vendor.index.__f__("log", "at pages/login/login.vue:118", "自动登录流程完成，进入本地Token校验阶段");
      }
    },
    // 校验本地Token：有则直接跳转，无则显示登录表单（逻辑保留，增加兼容性）
    async checkLocalToken() {
      common_vendor.index.__f__("log", "at pages/login/login.vue:124", "进入checkLocalToken方法 - 开始校验本地登录状态");
      this.isLoading = true;
      try {
        const localAutoToken = common_vendor.index.getStorageSync("autoToken");
        const localManualToken = common_vendor.index.getStorageSync("token");
        const localUser = common_vendor.index.getStorageSync("userInfo");
        common_vendor.index.__f__("log", "at pages/login/login.vue:132", "从本地存储获取数据:", {
          hasAutoToken: !!localAutoToken,
          hasManualToken: !!localManualToken,
          hasUserInfo: !!localUser
        });
        if ((localAutoToken || localManualToken) && (localUser == null ? void 0 : localUser.teacherId)) {
          common_vendor.index.__f__("log", "at pages/login/login.vue:140", "本地验证通过: 存在有效Token和完整用户信息");
          this.showMsg("已登录，正在跳转", "success");
          setTimeout(() => {
            common_vendor.index.setStorageSync("isLogin", true);
            common_vendor.index.switchTab({
              url: "/pages/index/index"
            });
          }, 1e3);
        } else {
          common_vendor.index.__f__("log", "at pages/login/login.vue:150", "本地无有效Token，需要用户手动登录");
          this.showLoginForm = true;
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:155", "Token校验过程发生异常:", err);
        this.showMsg("登录状态校验异常，请重试");
        this.showLoginForm = true;
      } finally {
        this.isLoading = false;
        common_vendor.index.__f__("log", "at pages/login/login.vue:160", "checkLocalToken方法执行完成");
      }
    },
    /**
     * 用户手动登录逻辑（保留原功能，兼容用户手动输入信息的场景）
     */
    async handleLogin() {
      common_vendor.index.__f__("log", "at pages/login/login.vue:168", "进入handleLogin方法 - 执行用户手动登录逻辑");
      this.isLoading = true;
      try {
        if (!this.form.teacherId.trim() || !this.form.name.trim()) {
          throw new Error("请输入完整的教工号和姓名");
        }
        const wxLoginRes = await new Promise((resolve, reject) => {
          common_vendor.index.login({
            provider: "weixin",
            success: (res) => res.code ? resolve(res.code) : reject(new Error(
              `获取code失败: ${res.errMsg}`
            )),
            fail: (err) => reject(new Error(`微信登录接口失败: ${err.errMsg}`))
          });
        });
        const loginRes = await src_utils_request_request.post("http://127.0.0.1:8080/login", {
          weixincode: wxLoginRes,
          username: this.form.teacherId.trim(),
          password: this.form.teacherId.trim()
        });
        if (loginRes == null ? void 0 : loginRes.token) {
          common_vendor.index.__f__("log", "at pages/login/login.vue:196", "手动登录成功，获取到token:", loginRes.token);
          const userInfo = {
            teacherId: this.form.teacherId.trim(),
            name: this.form.name.trim(),
            loginTime: (/* @__PURE__ */ new Date()).toLocaleString(),
            token: loginRes.token
          };
          common_vendor.index.setStorageSync("token", loginRes.token);
          common_vendor.index.setStorageSync("userInfo", userInfo);
          common_vendor.index.setStorageSync("isLogin", true);
          this.showMsg("登录成功，即将跳转", "success");
          setTimeout(() => {
            common_vendor.index.switchTab({
              url: "/pages/index/index"
            });
          }, 1e3);
        } else {
          const errorMsg = (loginRes == null ? void 0 : loginRes.msg) || "登录失败，请检查教工号和姓名";
          throw new Error(errorMsg);
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:223", "手动登录异常:", err);
        this.showMsg(err.message || "登录异常，请重试");
      } finally {
        this.isLoading = false;
      }
    }
  },
  onUnload() {
    common_vendor.index.__f__("log", "at pages/login/login.vue:233", "登录页onUnload生命周期触发");
    if (this.msgTimer) {
      clearTimeout(this.msgTimer);
    }
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
    b: common_vendor.t($data.form.teacherId ? "欢迎回来" : "请登录"),
    c: common_vendor.o(($event) => $data.form.teacherId = $event.detail.value.trim()),
    d: $data.form.teacherId,
    e: $data.isLoading,
    f: common_vendor.o(($event) => $data.form.name = $event.detail.value.trim()),
    g: $data.form.name,
    h: $data.isLoading,
    i: common_vendor.t($data.isLoading ? "登录中..." : "请点击登录"),
    j: common_vendor.o((...args) => $options.handleLogin && $options.handleLogin(...args)),
    k: !$data.form.teacherId || !$data.form.name || $data.isLoading
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
