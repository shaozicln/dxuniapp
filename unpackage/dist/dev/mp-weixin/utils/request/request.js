"use strict";
const common_vendor = require("../../common/vendor.js");
const getBaseURL = () => {
  var _a, _b, _c;
  const instance = common_vendor.getCurrentInstance();
  let baseUrl = ((_c = (_b = (_a = instance == null ? void 0 : instance.appContext) == null ? void 0 : _a.config) == null ? void 0 : _b.globalProperties) == null ? void 0 : _c.$URL) || "http://localhost:8080";
  return baseUrl.replace(/\/$/, "");
};
const request = (options) => {
  const baseURL = getBaseURL();
  let fullUrl = options.url;
  if (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://")) {
    const path = fullUrl.replace(/^\/+/, "");
    fullUrl = `${baseURL}/${path}`;
  }
  const token = common_vendor.index.getStorageSync("token") || "";
  const defaultHeaders = {
    "Accept": "*/*",
    "Connection": "keep-alive",
    ...token && {
      "Authorization": token
    },
    // 有Token时才添加
    ...options.headers
    // 允许用户传入自定义头（可覆盖默认值）
  };
  common_vendor.index.__f__("log", "at utils/request/request.js:35", "请求URL:", fullUrl);
  common_vendor.index.__f__("log", "at utils/request/request.js:36", "请求头:", defaultHeaders);
  return new Promise((resolve, reject) => {
    common_vendor.index.request({
      ...options,
      url: fullUrl,
      header: defaultHeaders,
      // 注意uni-app中是header而非headers
      success: (res) => {
        if (res.statusCode === 401) {
          common_vendor.index.removeStorageSync("token");
          common_vendor.index.showToast({
            title: "登录已过期，请重新登录",
            icon: "none"
          });
          reject(new Error("Token失效"));
          return;
        }
        resolve(res.data);
      },
      fail: (err) => {
        reject(new Error(`请求失败: ${err.errMsg}`));
      }
    });
  });
};
const get = (url, data = {}, options = {}) => {
  return request({
    ...options,
    url,
    data,
    method: "GET"
  });
};
const post = (url, data = {}, options = {}) => {
  return request({
    ...options,
    url,
    data,
    method: "POST"
  });
};
const put = (url, data = {}, options = {}) => {
  return request({
    ...options,
    url,
    data,
    method: "PUT"
  });
};
const del = (url, data = {}, options = {}) => {
  return request({
    ...options,
    url,
    data,
    method: "DELETE"
  });
};
exports.del = del;
exports.get = get;
exports.post = post;
exports.put = put;
exports.request = request;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/utils/request/request.js.map
