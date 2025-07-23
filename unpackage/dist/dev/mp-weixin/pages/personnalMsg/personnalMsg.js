"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "personnalMsg",
  setup(__props) {
    const userInfo = common_vendor.reactive({
      avatar: "/static/default-avatar.png",
      name: "张明",
      identity: "学生",
      gender: "男",
      college: "计算机学院",
      className: "2023级软件班",
      major: "软件工程",
      studentId: "2023012345",
      contact: "138****6789"
    });
    const infoItems = common_vendor.ref([]);
    const navigateBack = () => {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        common_vendor.index.navigateBack({ delta: 1 });
      } else {
        common_vendor.index.redirectTo({ url: "/pages/my/my" });
      }
    };
    common_vendor.onMounted(() => {
      setTimeout(() => {
        infoItems.value = [
          { label: "姓名", value: userInfo.name },
          { label: "身份", value: userInfo.identity },
          { label: "性别", value: userInfo.gender },
          { label: "学院", value: userInfo.college },
          { label: "班级", value: userInfo.className },
          { label: "专业", value: userInfo.major },
          { label: "学号", value: userInfo.studentId },
          { label: "联系方式", value: userInfo.contact }
        ];
        common_vendor.index.__f__("log", "at pages/personnalMsg/personnalMsg.vue:71", "个人信息页面初始化完成");
      }, 0);
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(navigateBack),
        b: userInfo.avatar,
        c: common_vendor.f(infoItems.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.label),
            b: common_vendor.t(item.value),
            c: index
          };
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-fbcda4e7"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/personnalMsg/personnalMsg.js.map
