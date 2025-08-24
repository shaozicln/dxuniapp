"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_navigate_navigate = require("../../utils/navigate/navigate.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "my",
  setup(__props) {
    const userInfo = common_vendor.reactive({
      avatarUrl: "/static/default-avatar.png",
      nickname: "用户姓名"
    });
    const messageList = common_vendor.reactive([
      { id: 1, title: "系统通知", content: "新系统通知...", unread: true },
      { id: 2, title: "互动消息", content: "学生发来的未读消息", unread: true },
      { id: 3, title: "测试消息", content: "未读测试", unread: true }
    ]);
    const handleItemTap = (item) => {
      common_vendor.index.__f__("log", "at pages/my/my.vue:85", "点击消息:", item);
    };
    const cancelUnread = (index) => {
      messageList[index].unread = false;
    };
    const deleteMessage = (index) => {
      messageList.splice(index, 1);
    };
    const handleLongPress = (index) => {
      const currentItem = messageList[index];
      if (currentItem.unread)
        return;
      common_vendor.index.showActionSheet({
        itemList: ["恢复标红", "删除", "取消"],
        // 清晰命名
        success: (res) => {
          if (res.tapIndex === 0) {
            currentItem.unread = true;
          } else if (res.tapIndex === 1) {
            deleteMessage(index);
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("warn", "at pages/my/my.vue:115", "长按菜单调用失败:", err);
        }
      });
    };
    const goToProfile = async () => {
      try {
        await utils_navigate_navigate.navigateToWithLoading("/pages/personnalMsg/personnalMsg", {
          loadingText: "加载中...",
          onError: (err) => {
            common_vendor.index.__f__("warn", "at pages/my/my.vue:126", "跳转异常:", err);
          }
        });
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/my/my.vue:130", "跳转个人信息页失败:", err);
      }
    };
    return (_ctx, _cache) => {
      return {
        a: userInfo.avatarUrl,
        b: common_vendor.t(userInfo.nickname),
        c: common_vendor.o(goToProfile),
        d: common_vendor.f(messageList, (item, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.title),
            b: common_vendor.t(item.content),
            c: item.unread
          }, item.unread ? {
            d: common_vendor.o(($event) => cancelUnread(index), item.id),
            e: common_vendor.o(($event) => deleteMessage(index), item.id)
          } : {}, {
            f: item.unread ? 1 : "",
            g: common_vendor.o(($event) => handleItemTap(item), item.id),
            h: common_vendor.o(($event) => handleLongPress(index), item.id),
            i: item.id
          });
        })
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-2f1ef635"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my/my.js.map
