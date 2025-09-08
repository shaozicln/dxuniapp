"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const utils_request_request = require("./utils/request/request.js");
if (!Math) {
  "./pages/login/login.js";
  "./pages/index/index.js";
  "./pages/my/my.js";
  "./pages/personalMsg/personalMsg.js";
  "./pages/questionnaire/questionnaire.js";
  "./pages/questionnaire/questionnaireDetail.js";
  "./pages/questionnaire/checkCourseQnr.js";
}
const _sfc_main = {
  data() {
    return {
      // 标记：是否已完成首次登录态检查（防止 onShow 重复触发）
      hasInitedLoginCheck: false,
      PAGE_PATHS: {
        LOGIN: "/pages/login/login",
        INDEX: "/pages/index/index",
        MY: "/pages/my/my"
      },
      AUTHORIZED_PAGES: []
      // 初始为空，在 onLaunch 中初始化
    };
  },
  onLaunch: function() {
    common_vendor.index.__f__("log", "at App.vue:16", "App Launch");
    this.AUTHORIZED_PAGES = [
      this.PAGE_PATHS.INDEX,
      this.PAGE_PATHS.MY
    ];
    setTimeout(() => {
      this.checkOpenidStatus();
      this.hasInitedLoginCheck = true;
    }, 300);
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:28", "App Show");
    if (!this.hasInitedLoginCheck) {
      this.checkOpenidStatus();
      this.hasInitedLoginCheck = true;
    } else {
      const lastHideTime = this.$options.globalData.lastHideTime || 0;
      const currentTime = Date.now();
      if (currentTime - lastHideTime > 30 * 60 * 1e3) {
        this.checkOpenidStatus();
      }
    }
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:44", "App Hide");
    this.$options.globalData.lastHideTime = Date.now();
  },
  methods: {
    // 封装：检查 openid 登录态 + 控制跳转（核心优化）
    checkOpenidStatus() {
      let openid = "";
      try {
        openid = common_vendor.index.getStorageSync("openid") || "";
      } catch (err) {
        common_vendor.index.__f__("error", "at App.vue:56", "读取 openid 失败：", err);
        openid = "";
      }
      const pages = getCurrentPages();
      const currentPage = pages.length > 0 ? pages[pages.length - 1].route : "";
      const currentPageWithPrefix = currentPage ? `/${currentPage}` : "";
      common_vendor.index.__f__("log", "at App.vue:62", "当前页面路径：", currentPageWithPrefix);
      if (openid) {
        if (!this.AUTHORIZED_PAGES.includes(currentPageWithPrefix)) {
          if (currentPageWithPrefix !== this.PAGE_PATHS.INDEX) {
            this.redirectToPage(this.PAGE_PATHS.INDEX, "首页");
          }
        }
      } else {
        if (currentPageWithPrefix !== this.PAGE_PATHS.LOGIN) {
          this.redirectToPage(this.PAGE_PATHS.LOGIN, "登录页");
        }
      }
    },
    // 封装：统一跳转方法
    redirectToPage(targetPath, pageName) {
      const pagesConfig = common_vendor.index.getAppBaseInfo().pages || [];
      const isPathValid = pagesConfig.some((page) => page.path === targetPath.slice(1));
      if (!isPathValid) {
        common_vendor.index.__f__("error", "at App.vue:84", `跳转失败：${pageName}路径${targetPath}未在 pages.json 中注册`);
        return;
      }
      common_vendor.index.redirectTo({
        url: targetPath,
        success: () => {
          common_vendor.index.__f__("log", "at App.vue:91", `跳转${pageName}成功`);
        },
        fail: (err) => {
          if (err.errMsg.includes("can not redirectTo a tabbar page")) {
            common_vendor.index.__f__("warn", "at App.vue:96", `(${pageName}是 tabbar 页) 自动切换为 switchTab 跳转`);
            common_vendor.index.switchTab({
              url: targetPath,
              success: () => common_vendor.index.__f__("log", "at App.vue:99", `switchTab 跳转${pageName}成功`),
              fail: (tabErr) => common_vendor.index.__f__("error", "at App.vue:100", `switchTab 跳转${pageName}失败：`, tabErr)
            });
          } else {
            common_vendor.index.__f__("error", "at App.vue:103", `跳转${pageName}失败：`, err);
          }
        }
      });
    }
  },
  // 全局数据：存储切后台时间（跨生命周期访问）
  globalData: {
    lastHideTime: 0
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  app.config.globalProperties.$URL = "http://localhost:8080";
  app.config.globalProperties.$request = utils_request_request.request;
  app.config.globalProperties.$get = utils_request_request.get;
  app.config.globalProperties.$post = utils_request_request.post;
  app.config.globalProperties.$put = utils_request_request.put;
  app.config.globalProperties.$del = utils_request_request.del;
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
