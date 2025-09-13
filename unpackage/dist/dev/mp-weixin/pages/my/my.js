"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_my_userInfoManager = require("../../utils/my/userInfoManager.js");
const utils_my_messageHandler = require("../../utils/my/messageHandler.js");
const utils_my_navigationService = require("../../utils/my/navigationService.js");
const utils_my_errorHandler = require("../../utils/my/errorHandler.js");
const _sfc_main = {
  __name: "my",
  setup(__props) {
    const userInfo = common_vendor.reactive({
      avatar: "/static/default-avatar.png",
      name: "未设置",
      identity: "未登录",
      // 身份标识：领导/督导/教师/学生/未登录
      gender: "未设置",
      college: "未设置",
      className: "未设置",
      major: "未设置",
      studentID: "未设置",
      teacherID: "未设置",
      department: "未设置"
    });
    const userRole = common_vendor.computed(() => {
      return utils_my_userInfoManager.userInfoManager.getValidIdentity(userInfo.identity);
    });
    const unreadMsgCount = common_vendor.computed(() => {
      return utils_my_messageHandler.messageHandler.getUnreadCount(messageList.value);
    });
    const messageList = common_vendor.ref([
      { id: 1, title: "系统通知", content: "新系统通知已送达", unread: true },
      { id: 2, title: "互动消息", content: "有学生提交了反馈", unread: true },
      { id: 3, title: "待办提醒", content: "请及时完善个人信息", unread: true }
    ]);
    const refreshUserInfo = async () => {
      try {
        const initSuccess = await utils_my_userInfoManager.userInfoManager.initUserInfo(userInfo);
        if (!initSuccess) {
          common_vendor.index.__f__("warn", "at pages/my/my.vue:118", "用户信息刷新失败，使用默认值");
          userInfo.identity = "未登录";
        }
      } catch (err) {
        utils_my_errorHandler.errorHandler.handleUserInitError(
          userInfo,
          err,
          () => utils_my_navigationService.navigationService.goToLogin()
        );
      }
    };
    common_vendor.onMounted(async () => {
      await refreshUserInfo();
    });
    common_vendor.onShow(async () => {
      await refreshUserInfo();
    });
    common_vendor.onMounted(() => {
      common_vendor.index.$on("loginSuccess", async () => {
        common_vendor.index.__f__("log", "at pages/my/my.vue:144", "收到登录成功事件，刷新用户信息");
        await refreshUserInfo();
      });
    });
    common_vendor.onUnload(() => {
      common_vendor.index.$off("loginSuccess");
    });
    const handleAvatarError = (e) => {
      utils_my_errorHandler.errorHandler.handleAvatarError(e);
    };
    const handleItemTap = (item, index) => {
      utils_my_messageHandler.messageHandler.handleItemTap(messageList.value, item, index);
    };
    const cancelUnread = (index) => {
      utils_my_messageHandler.messageHandler.cancelUnread(messageList.value, index);
    };
    const deleteMessage = async (index) => {
      await utils_my_messageHandler.messageHandler.deleteMessage(messageList.value, index);
    };
    const handleLongPress = (item, index) => {
      utils_my_messageHandler.messageHandler.handleLongPress(messageList.value, item, index);
    };
    const goToProfile = async () => {
      await utils_my_navigationService.navigationService.goToProfileEdit(
        userRole.value,
        userInfo,
        []
        // 如需排除敏感字段，在此添加，例如['token']
      );
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: userInfo.avatar,
        b: common_vendor.o(handleAvatarError),
        c: common_vendor.t(userInfo.name || "未设置昵称"),
        d: common_vendor.t(userRole.value || "未登录"),
        e: common_vendor.o(goToProfile),
        f: unreadMsgCount.value > 0
      }, unreadMsgCount.value > 0 ? {
        g: common_vendor.t(unreadMsgCount.value)
      } : {}, {
        h: messageList.value.length === 0
      }, messageList.value.length === 0 ? {
        i: common_assets._imports_0$1
      } : {}, {
        j: common_vendor.f(messageList.value, (item, index, i0) => {
          return common_vendor.e({
            a: item.unread
          }, item.unread ? {} : {}, {
            b: common_vendor.t(item.title || "无标题消息"),
            c: common_vendor.t(item.content || "无内容"),
            d: item.unread
          }, item.unread ? {
            e: common_vendor.o(($event) => cancelUnread(index), `msg-${item.id}`),
            f: common_vendor.o(($event) => deleteMessage(index), `msg-${item.id}`)
          } : {}, {
            g: item.unread ? 1 : "",
            h: common_vendor.o(($event) => handleItemTap(item, index), `msg-${item.id}`),
            i: common_vendor.o(($event) => handleLongPress(item, index), `msg-${item.id}`),
            j: `msg-${item.id}`
          });
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-2f1ef635"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my/my.js.map
