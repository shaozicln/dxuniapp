"use strict";
const common_vendor = require("../../../common/vendor.js");
function navigateToWithLoading(url, options = {}) {
  var _a;
  if (!url || !url.startsWith("/")) {
    const err = new Error(`跳转路径不合法：${url}，需以 / 开头（如 /pages/index/index）`);
    err.errMsg = `navigateToWithLoading:fail ${err.message}`;
    (_a = options.onError) == null ? void 0 : _a.call(options, err);
    common_vendor.index.showToast({ title: "路径错误", icon: "none" });
    return Promise.reject(err);
  }
  common_vendor.index.showLoading({
    title: options.loadingText || "加载中...",
    mask: true,
    success: () => {
    },
    fail: (loadErr) => {
      var _a2;
      (_a2 = options.onError) == null ? void 0 : _a2.call(options, loadErr);
      return Promise.reject(loadErr);
    }
  });
  return new Promise((resolve, reject) => {
    common_vendor.index.navigateTo({
      url,
      success: (res) => {
        var _a2;
        common_vendor.index.hideLoading();
        (_a2 = options.success) == null ? void 0 : _a2.call(options, res);
        resolve(res);
      },
      fail: (err) => {
        var _a2;
        common_vendor.index.hideLoading();
        if (options.onError) {
          options.onError(err);
        } else {
          const errorMap = {
            "page not found": "页面不存在",
            "timeout": "加载超时",
            "navigateTo:fail can not navigate to tabbar page": "不能跳转到 tabbar 页面（需用 switchTab）",
            'navigateTo:fail page "xxx" is not found': "目标页面未在 pages.json 注册"
          };
          const matchKey = Object.keys(errorMap).find(
            (key) => err.errMsg.toLowerCase().includes(key.toLowerCase())
          ) || "default";
          common_vendor.index.showToast({
            title: errorMap[matchKey] || "跳转失败",
            icon: "none",
            duration: 2e3
          });
          common_vendor.index.__f__("error", "at src/utils/navigate/navigate.ts:58", "页面跳转失败:", err);
        }
        (_a2 = options.fail) == null ? void 0 : _a2.call(options, err);
        reject(err);
      }
    });
  });
}
exports.navigateToWithLoading = navigateToWithLoading;
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/src/utils/navigate/navigate.js.map
