"use strict";
const common_vendor = require("../../common/vendor.js");
function navigateToWithLoading(url, options = {}) {
  common_vendor.index.showLoading({ title: options.loadingText || "加载中..." });
  return new Promise((resolve, reject) => {
    common_vendor.index.navigateTo({
      url,
      success: (res) => {
        var _a;
        common_vendor.index.hideLoading();
        (_a = options.success) == null ? void 0 : _a.call(options);
        resolve(res);
      },
      fail: (err) => {
        var _a;
        common_vendor.index.hideLoading();
        if (options.onError) {
          options.onError(err);
        } else {
          const errorMap = {
            "page not found": "页面不存在",
            "timeout": "加载超时"
          };
          const matchKey = Object.keys(errorMap).find((key) => err.errMsg.includes(key)) || "default";
          common_vendor.index.showToast({
            title: errorMap[matchKey] || "跳转失败",
            icon: "none"
          });
          common_vendor.index.__f__("error", "at utils/navigate/navigate.ts:36", "跳转错误:", err);
        }
        (_a = options.fail) == null ? void 0 : _a.call(options, err);
        reject(err);
      }
    });
  });
}
exports.navigateToWithLoading = navigateToWithLoading;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/utils/navigate/navigate.js.map
