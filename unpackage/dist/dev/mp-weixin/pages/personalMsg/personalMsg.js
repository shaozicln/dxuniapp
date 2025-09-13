"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_personnalMsg_userInfoUtil = require("../../utils/personnalMsg/userInfoUtil.js");
const utils_personnalMsg_logoutUtil = require("../../utils/personnalMsg/logoutUtil.js");
const utils_personnalMsg_storage = require("../../utils/personnalMsg/storage.js");
const _sfc_main = {
  __name: "personalMsg",
  setup(__props) {
    const userInfo = common_vendor.reactive({
      avatar: "/static/default-avatar.png",
      name: "未设置",
      identity: "未登录",
      gender: "未设置",
      college: "未设置",
      className: "未设置",
      major: "未设置",
      studentID: "未设置",
      teacherID: "",
      department: "未设置"
    });
    const infoItems = common_vendor.ref([]);
    const navigateBack = () => {
      common_vendor.index.navigateBack({ delta: 1 }).catch(() => {
        common_vendor.index.switchTab({ url: "/pages/my/my" });
      });
    };
    const handleInfoEdit = (item) => {
      if (!item.canEdit)
        return;
      const editableFields = utils_personnalMsg_userInfoUtil.userInfoUtil.getEditableFields(userInfo.identity);
      const fieldConfig = editableFields.find((cfg) => cfg.label === item.label);
      if (!fieldConfig)
        return;
      if (fieldConfig.type === "select") {
        common_vendor.index.showActionSheet({
          itemList: fieldConfig.options,
          success: (res) => {
            userInfo[fieldConfig.field] = fieldConfig.options[res.tapIndex];
            updateInfoAndStorage();
          },
          fail: (err) => common_vendor.index.__f__("error", "at pages/personalMsg/personalMsg.vue:82", "编辑失败:", err)
        });
      } else if (fieldConfig.type === "input") {
        common_vendor.index.showModal({
          title: `修改${item.label}`,
          editable: true,
          placeholderText: fieldConfig.placeholder,
          value: item.value !== "未设置" ? item.value : "",
          success: (res) => {
            if (res.confirm && res.content.trim()) {
              userInfo[fieldConfig.field] = res.content.trim();
              updateInfoAndStorage();
            }
          },
          fail: (err) => common_vendor.index.__f__("error", "at pages/personalMsg/personalMsg.vue:96", "编辑失败:", err)
        });
      }
    };
    const updateInfoAndStorage = () => {
      infoItems.value = utils_personnalMsg_userInfoUtil.userInfoUtil.generateInfoList(userInfo);
      utils_personnalMsg_storage.storageUtil.saveUserInfo(userInfo);
    };
    const handleLogout = () => {
      utils_personnalMsg_logoutUtil.logoutUtil.doLogout();
    };
    common_vendor.onMounted(() => {
      utils_personnalMsg_userInfoUtil.userInfoUtil.initFromStorage(userInfo);
      updateInfoAndStorage();
      common_vendor.index.__f__("log", "at pages/personalMsg/personalMsg.vue:113", "个人页初始化后身份信息:", userInfo.identity);
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(navigateBack),
        b: userInfo.avatar,
        c: common_vendor.f(infoItems.value, (item, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.label),
            b: common_vendor.t(item.value),
            c: item.canEdit
          }, item.canEdit ? {} : {}, {
            d: common_vendor.n({
              "editable-item": item.canEdit
            }),
            e: index,
            f: common_vendor.o(($event) => handleInfoEdit(item), index)
          });
        }),
        d: common_vendor.o(handleLogout)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b99c0b3f"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/personalMsg/personalMsg.js.map
