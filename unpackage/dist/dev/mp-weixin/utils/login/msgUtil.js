"use strict";
const common_vendor = require("../../common/vendor.js");
const loginMsgUtil = {
  showMsg(context, message, type = "error") {
    if (context.msgTimer)
      clearTimeout(context.msgTimer);
    context.msg = message;
    context.msgType = type;
    context.msgTimer = setTimeout(() => {
      context.msg = "";
    }, 5e3);
    common_vendor.index.__f__("log", "at utils/login/msgUtil.js:11", `[登录页消息] 类型: ${type}, 内容: ${message}`);
  },
  //清除消息定时器（页面卸载时调用）
  clearMsgTimer(context) {
    if (context.msgTimer) {
      clearTimeout(context.msgTimer);
      context.msgTimer = null;
    }
  }
};
exports.loginMsgUtil = loginMsgUtil;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/utils/login/msgUtil.js.map
