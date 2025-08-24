"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      title: "欢迎"
    };
  },
  onLoad() {
  },
  methods: {
    navigateToQuestionnaire() {
      common_vendor.index.navigateTo({
        url: "/pages/questionnaire/questionnaire"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0,
    b: common_vendor.t($data.title),
    c: common_assets._imports_1,
    d: common_vendor.o((...args) => $options.navigateToQuestionnaire && $options.navigateToQuestionnaire(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
