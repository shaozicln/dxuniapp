"use strict";
const common_vendor = require("../../../common/vendor.js");
const getBaseURL = () => {
  let baseUrl = "https://jxpj.neau.edu.cn/api/v1";
  const formattedUrl = baseUrl.replace(/\/$/, "");
  common_vendor.index.__f__("log", "at src/utils/request/request.js:25", "格式化后的基础 URL:", formattedUrl);
  return formattedUrl;
};
const request = (options) => {
  const baseURL = getBaseURL();
  let fullUrl = options.url;
  if (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://")) {
    const path = fullUrl.replace(/^\/+/, "");
    fullUrl = `${baseURL}/${path}`;
  }
  const token = common_vendor.index.getStorageSync("Admin-Token") || "";
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
  common_vendor.index.__f__("log", "at src/utils/request/request.js:54", "请求URL:", fullUrl);
  common_vendor.index.__f__("log", "at src/utils/request/request.js:55", "请求头:", defaultHeaders);
  return new Promise((resolve, reject) => {
    common_vendor.index.request({
      ...options,
      url: fullUrl,
      header: defaultHeaders,
      // 注意uni-app中是header而非headers
      success: (res) => {
        if (res.statusCode === 401) {
          common_vendor.index.removeStorageSync("Admin-Token");
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
const post = (url, data = {}, options = {}) => {
  return request({
    ...options,
    url,
    data,
    method: "POST"
  });
};
exports.post = post;
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/src/utils/request/request.js.map
