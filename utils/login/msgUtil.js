// 统一消息提示工具：封装定时器、消息显示逻辑
export const loginMsgUtil = {
  showMsg(context, message, type = 'error') {
    // 清除已有定时器，避免重复提示
    if (context.msgTimer) clearTimeout(context.msgTimer);
    context.msg = message;
    context.msgType = type;
    context.msgTimer = setTimeout(() => {
      context.msg = '';
    }, 5000);
    console.log(`[登录页消息] 类型: ${type}, 内容: ${message}`);
  },
//清除消息定时器（页面卸载时调用）
  clearMsgTimer(context) {
    if (context.msgTimer) {
      clearTimeout(context.msgTimer);
      context.msgTimer = null;
    }
  }
};