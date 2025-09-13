"use strict";
const common_vendor = require("../../common/vendor.js");
const messageHandler = {
  /**
   * 处理消息点击事件
   * @param {Array} messageList - 消息列表数组
   * @param {Object} item - 消息项
   * @param {number} index - 消息索引
   */
  handleItemTap(messageList, item, index) {
    if (!this.isValidMessageIndex(messageList, item, index))
      return;
    common_vendor.index.__f__("log", "at utils/my/messageHandler.js:12", "点击消息：", item);
    if (item.unread) {
      messageList[index].unread = false;
    }
  },
  /**
   * 取消消息标红
   * @param {Array} messageList - 消息列表数组
   * @param {number} index - 消息索引
   */
  cancelUnread(messageList, index) {
    if (!this.isValidIndex(messageList, index))
      return;
    messageList[index].unread = false;
    common_vendor.index.showToast({ title: "已取消标红", icon: "none", duration: 1200 });
  },
  /**
   * 显示删除确认弹窗
   * @param {number} index - 消息索引
   * @returns {Promise<boolean>} 是否确认删除
   */
  showDeleteConfirm(index) {
    return new Promise((resolve) => {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "此消息删除后不可恢复，是否继续？",
        mask: true,
        success: (res) => resolve(res.confirm),
        fail: (err) => {
          common_vendor.index.__f__("warn", "at utils/my/messageHandler.js:43", "删除确认弹窗调用失败：", err);
          resolve(false);
        }
      });
    });
  },
  /**
   * 删除消息
   * @param {Array} messageList - 消息列表数组
   * @param {number} index - 消息索引
   * @returns {Promise<void>}
   */
  async deleteMessage(messageList, index) {
    if (!this.isValidIndex(messageList, index))
      return;
    const confirm = await this.showDeleteConfirm(index);
    if (!confirm)
      return;
    messageList.splice(index, 1);
    common_vendor.index.showToast({ title: "消息已删除", icon: "none", duration: 1200 });
  },
  /**
   * 处理消息长按事件
   * @param {Array} messageList - 消息列表数组
   * @param {Object} item - 消息项
   * @param {number} index - 消息索引
   */
  handleLongPress(messageList, item, index) {
    if (!this.isValidMessageIndex(messageList, item, index))
      return;
    if (item.unread) {
      common_vendor.index.showToast({
        title: "未读消息暂不支持长按操作",
        icon: "none",
        duration: 1500
      });
      return;
    }
    common_vendor.index.showActionSheet({
      itemList: ["恢复标红", "删除"],
      itemColor: "#333",
      mask: true,
      success: (res) => {
        if (res.cancel)
          return;
        switch (res.tapIndex) {
          case 0:
            messageList[index].unread = true;
            common_vendor.index.showToast({ title: "已恢复标红", icon: "none", duration: 1200 });
            break;
          case 1:
            this.deleteMessage(messageList, index);
            break;
        }
      },
      fail: (err) => {
        common_vendor.index.__f__("warn", "at utils/my/messageHandler.js:103", "长按操作菜单调用失败：", err);
      }
    });
  },
  /**
   * 计算未读消息数量
   * @param {Array} messageList - 消息列表数组
   * @returns {number} 未读消息数量
   */
  getUnreadCount(messageList) {
    return (messageList || []).filter((item) => item == null ? void 0 : item.unread).length;
  },
  /**
   * 验证消息索引有效性
   * @param {Array} messageList - 消息列表数组
   * @param {Object} item - 消息项
   * @param {number} index - 消息索引
   * @returns {boolean} 索引是否有效
   */
  isValidMessageIndex(messageList, item, index) {
    return !!item && this.isValidIndex(messageList, index);
  },
  /**
   * 验证索引有效性
   * @param {Array} list - 数组
   * @param {number} index - 索引
   * @returns {boolean} 索引是否有效
   */
  isValidIndex(list, index) {
    return Array.isArray(list) && index >= 0 && index < list.length;
  }
};
exports.messageHandler = messageHandler;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/utils/my/messageHandler.js.map
