"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "personalMsg",
  setup(__props) {
    const userInfo = common_vendor.reactive({
      avatar: "/static/default-avatar.png",
      // 本地默认头像路径（确保文件存在）
      name: "未设置",
      identity: "未登录",
      gender: "未设置",
      college: "未设置",
      className: "未设置",
      major: "未设置",
      studentId: "未设置",
      teacherId: "",
      contact: "未设置"
    });
    const infoItems = common_vendor.ref([]);
    const editableFields = [
      { label: "性别", field: "gender", type: "select", options: ["男", "女", "保密"] },
      { label: "学院", field: "college", type: "input", placeholder: "请输入学院名称" },
      { label: "班级", field: "className", type: "input", placeholder: "请输入班级（如计科2301）" },
      { label: "专业", field: "major", type: "input", placeholder: "请输入专业名称" },
      { label: "联系方式", field: "contact", type: "input", placeholder: "请输入手机号" }
    ];
    const navigateBack = () => {
      common_vendor.index.navigateBack({ delta: 1 }).catch(() => {
        common_vendor.index.redirectTo({ url: "/pages/my/my" });
      });
    };
    const handleInfoEdit = (item) => {
      const fieldConfig = editableFields.find((config) => config.label === item.label);
      if (!fieldConfig)
        return;
      if (fieldConfig.type === "select") {
        common_vendor.index.showActionSheet({
          itemList: fieldConfig.options,
          success: (res) => {
            const selectedValue = fieldConfig.options[res.tapIndex];
            userInfo[fieldConfig.field] = selectedValue;
            updateInfoListAndStorage();
          },
          fail: (err) => common_vendor.index.__f__("error", "at pages/personalMsg/personalMsg.vue:88", "选择失败:", err)
        });
      } else if (fieldConfig.type === "input") {
        common_vendor.index.showModal({
          title: `修改${item.label}`,
          editable: true,
          placeholderText: fieldConfig.placeholder,
          value: item.value !== "未设置" ? item.value : "",
          success: (res) => {
            if (res.confirm && res.content.trim()) {
              const inputValue = res.content.trim();
              userInfo[fieldConfig.field] = inputValue;
              updateInfoListAndStorage();
            }
          },
          fail: (err) => common_vendor.index.__f__("error", "at pages/personalMsg/personalMsg.vue:105", "输入弹窗失败:", err)
        });
      }
    };
    const updateInfoListAndStorage = () => {
      infoItems.value = [
        { label: "姓名", value: userInfo.name, canEdit: false },
        { label: "身份", value: userInfo.identity, canEdit: false },
        { label: "性别", value: userInfo.gender, canEdit: true },
        { label: "学院", value: userInfo.college, canEdit: true },
        { label: "班级", value: userInfo.className, canEdit: true },
        { label: "专业", value: userInfo.major, canEdit: true },
        {
          label: userInfo.identity === "老师" ? "教工号" : "学号",
          value: userInfo.teacherId || userInfo.studentId,
          canEdit: false
        },
        { label: "联系方式", value: userInfo.contact, canEdit: true }
      ];
      try {
        const oldUserInfo = common_vendor.index.getStorageSync("userInfo") || {};
        const newUserInfo = { ...oldUserInfo, ...userInfo };
        common_vendor.index.setStorageSync("userInfo", newUserInfo);
        common_vendor.index.__f__("log", "at pages/personalMsg/personalMsg.vue:132", "用户信息已保存到本地:", newUserInfo);
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/personalMsg/personalMsg.vue:134", "保存失败:", err);
        common_vendor.index.showToast({ title: "保存失败，请重试", icon: "none" });
      }
    };
    const handleLogout = () => {
      common_vendor.index.showModal({
        title: "确认退出",
        content: "退出后需重新登录，是否继续？",
        confirmText: "退出",
        cancelText: "取消",
        success: (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.removeStorageSync("userInfo");
            } catch (err) {
              common_vendor.index.__f__("error", "at pages/personalMsg/personalMsg.vue:151", "清除登录状态失败:", err);
            }
            common_vendor.index.showToast({ title: "已退出登录", icon: "none", duration: 1500 });
            setTimeout(() => {
              common_vendor.index.redirectTo({ url: "/pages/login/login" });
            }, 1500);
          }
        }
      });
    };
    common_vendor.onMounted(() => {
      var _a;
      try {
        const storedUserInfo = common_vendor.index.getStorageSync("userInfo");
        if (storedUserInfo) {
          Object.keys(userInfo).forEach((key) => {
            if (storedUserInfo[key] !== void 0 && storedUserInfo[key] !== "") {
              userInfo[key] = storedUserInfo[key];
            }
          });
          userInfo.identity = ((_a = userInfo.teacherId) == null ? void 0 : _a.startsWith("Z")) ? "老师" : "学生";
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/personalMsg/personalMsg.vue:175", "读取用户信息失败:", err);
        common_vendor.index.showToast({ title: "信息加载失败", icon: "none" });
      }
      updateInfoListAndStorage();
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
