"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = common_vendor.defineComponent({
  name: "MyPage",
  setup() {
    const userInfo = common_vendor.reactive({
      avatarUrl: "/static/default-avatar.png",
      nickname: "用户姓名"
    });
    const messageList = common_vendor.reactive([
      {
        id: 1,
        title: "系统通知",
        content: "您有一条新的系统通知内容...",
        unread: true
      },
      {
        id: 2,
        title: "互动消息",
        content: "有人给您点了一个赞",
        unread: false
      },
      {
        id: 3,
        title: "新消息测试",
        content: "这是一条未读测试消息",
        unread: true
      }
    ]);
    const handleItemTap = (item) => {
      common_vendor.index.__f__("log", "at pages/my/my.vue:100", "点击了消息：", item);
    };
    const cancelUnread = (index) => {
      messageList[index].unread = false;
    };
    const deleteMessage = (index) => {
      messageList.splice(index, 1);
    };
    const goToProfile = () => {
      common_vendor.index.showLoading({
        title: "加载中",
        mask: true
      });
      setTimeout(() => {
        common_vendor.index.navigateTo({
          url: "/pages/personnalMsg/personnalMsg",
          success: () => common_vendor.index.hideLoading(),
          fail: (err) => {
            common_vendor.index.hideLoading();
            common_vendor.index.__f__("error", "at pages/my/my.vue:127", "跳转失败:", err);
            common_vendor.index.showToast({
              title: "页面加载超时",
              icon: "none"
            });
          }
        });
      }, 50);
    };
    return {
      userInfo,
      messageList,
      handleItemTap,
      cancelUnread,
      deleteMessage,
      goToProfile
    };
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: _ctx.userInfo.avatarUrl,
    b: common_vendor.t(_ctx.userInfo.nickname),
    c: common_vendor.o((...args) => _ctx.goToProfile && _ctx.goToProfile(...args)),
    d: common_vendor.f(_ctx.messageList, (item, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.title),
        b: common_vendor.t(item.content),
        c: item.unread
      }, item.unread ? {
        d: common_vendor.o(($event) => _ctx.cancelUnread(index), item.id),
        e: common_vendor.o(($event) => _ctx.deleteMessage(index), item.id)
      } : {}, {
        f: item.unread ? 1 : "",
        g: common_vendor.o(($event) => _ctx.handleItemTap(item), item.id),
        h: item.id
      });
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-2f1ef635"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my/my.js.map
