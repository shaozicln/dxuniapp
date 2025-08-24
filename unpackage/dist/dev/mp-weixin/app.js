"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const utils_request_request = require("./utils/request/request.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/my/my.js";
  "./pages/personnalMsg/personnalMsg.js";
  "./pages/questionnaire/questionnaire.js";
  "./pages/questionnaire/questionnaireDetail.js";
  "./pages/questionnaire/checkCourseQnr.js";
}
const _sfc_main = {
  onLaunch: function() {
    common_vendor.index.__f__("log", "at App.vue:4", "App Launch");
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:7", "App Show");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:10", "App Hide");
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
