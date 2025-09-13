"use strict";
const common_vendor = require("../../common/vendor.js");
function navigateToWithLoading(url, options = {}) {
  common_vendor.index.showLoading({
    title: options.loadingText || "加载中...",
    mask: true
  });
  return new Promise((resolve, reject) => {
    common_vendor.index.navigateTo({
      url,
      // 解构原生参数（如 query、events 等，继承自 NavigateToOptions）
      ...options,
      // 成功回调：隐藏加载+触发外部 success+resolve
      success: (res) => {
        var _a;
        common_vendor.index.hideLoading();
        (_a = options.success) == null ? void 0 : _a.call(options, res);
        resolve(res);
      },
      // 失败回调：隐藏加载+触发外部 onError/fail+reject
      fail: (err) => {
        var _a;
        common_vendor.index.hideLoading();
        if (options.onError) {
          options.onError(err);
        } else {
          const errorMap = {
            "page not found": "页面不存在",
            "timeout": "加载超时",
            "can not redirectTo a tabbar page": "不能跳转到 tabbar 页面"
          };
          const matchKey = Object.keys(errorMap).find((key) => err.errMsg.includes(key)) || "default";
          common_vendor.index.showToast({
            title: errorMap[matchKey] || "跳转失败，请重试",
            icon: "none",
            duration: 2500
          });
          common_vendor.index.__f__("error", "at utils/navigate/navigate.ts:60", "跳转错误详情:", err);
        }
        (_a = options.fail) == null ? void 0 : _a.call(options, err);
        reject(err);
      }
    });
  });
}
exports.navigateToWithLoading = navigateToWithLoading;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/utils/navigate/navigate.js.map
