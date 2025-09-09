"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_navigate_navigate = require("../../utils/navigate/navigate.js");
const utils_personnalMsg_userInfoUtil = require("../../utils/personnalMsg/userInfoUtil.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "my",
  setup(__props) {
    const userInfo = common_vendor.reactive({
      avatar: "/static/default-avatar.png",
      name: "未设置",
      identity: "未登录"
    });
    const userRole = common_vendor.ref(userInfo.identity);
    const messageList = common_vendor.reactive([
      { id: 1, title: "系统通知", content: "新系统通知...", unread: true },
      { id: 2, title: "互动消息", content: "学生发来的未读消息", unread: true },
      { id: 3, title: "测试消息", content: "未读测试", unread: true }
    ]);
    common_vendor.onMounted(() => {
      try {
        utils_personnalMsg_userInfoUtil.userInfoUtil.initFromStorage(userInfo);
        userRole.value = userInfo.identity;
        common_vendor.index.__f__("log", "at pages/my/my.vue:100", "核心信息初始化完成：", {
          姓名: userInfo.name,
          身份: userRole.value
        });
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/my/my.vue:105", "核心信息初始化失败:", err);
        common_vendor.index.showToast({ title: "信息加载失败", icon: "none" });
        userRole.value = "身份未知";
      }
    });
    const handleItemTap = (item) => {
      common_vendor.index.__f__("log", "at pages/my/my.vue:113", "点击消息:", item);
      if (item.unread) {
        const index = messageList.findIndex((msg) => msg.id === item.id);
        if (index !== -1)
          messageList[index].unread = false;
      }
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
        success: (res) => {
          if (res.tapIndex === 0) {
            currentItem.unread = true;
          } else if (res.tapIndex === 1) {
            deleteMessage(index);
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("warn", "at pages/my/my.vue:142", "长按菜单调用失败:", err);
        }
      });
    };
    const goToProfile = async () => {
      try {
        await utils_navigate_navigate.navigateToWithLoading("/pages/personalMsg/personalMsg", {
          loadingText: "加载中...",
          onError: (err) => {
            common_vendor.index.__f__("warn", "at pages/my/my.vue:152", "跳转异常:", err);
            common_vendor.index.showToast({ title: "跳转失败", icon: "none" });
          }
        });
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/my/my.vue:157", "跳转个人信息页失败:", err);
        common_vendor.index.showToast({ title: "跳转失败", icon: "none" });
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: userInfo.avatarUrl,
        b: common_vendor.t(userInfo.name),
        c: common_vendor.t(userRole.value),
        d: common_vendor.o(goToProfile),
        e: messageList.length === 0
      }, messageList.length === 0 ? {} : {
        f: common_vendor.f(messageList, (item, index, i0) => {
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
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-2f1ef635"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my/my.js.map
