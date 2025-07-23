"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "questionnaire-detail",
  setup(__props) {
    const questionnaire = common_vendor.ref(null);
    common_vendor.onMounted(() => {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const data = currentPage.options.data;
      if (data) {
        const currentQuestionnaire = JSON.parse(decodeURIComponent(data));
        const allQuestionnaires = JSON.parse(common_vendor.index.getStorageSync("questionnaires") || "[]");
        const storedQuestionnaire = allQuestionnaires.find((q) => q.id === currentQuestionnaire.id);
        if (storedQuestionnaire) {
          questionnaire.value = storedQuestionnaire;
        } else {
          questionnaire.value = currentQuestionnaire;
        }
      } else {
        common_vendor.index.navigateBack();
      }
    });
    const handleBack = () => {
      common_vendor.index.navigateBack({
        delta: 1
      });
    };
    const selectOption = (questionId, optionId) => {
      if (!questionnaire.value)
        return;
      const question = questionnaire.value.questions.find((q) => q.id === questionId);
      if (!question)
        return;
      if (question.type === "single" || question.type === "rating") {
        question.answer = optionId;
      } else if (question.type === "multiple") {
        if (!question.answer) {
          question.answer = [optionId];
        } else if (question.answer.includes(optionId)) {
          question.answer = question.answer.filter((id) => id !== optionId);
        } else {
          question.answer.push(optionId);
        }
      }
    };
    const isOptionSelected = (questionId, optionId) => {
      if (!questionnaire.value)
        return false;
      const question = questionnaire.value.questions.find((q) => q.id === questionId);
      if (!question || !question.answer)
        return false;
      if (question.type === "single" || question.type === "rating") {
        return question.answer === optionId;
      } else if (question.type === "multiple") {
        return question.answer.includes(optionId);
      }
      return false;
    };
    const submitQuestionnaire = () => {
      if (!questionnaire.value)
        return;
      const allAnswered = questionnaire.value.questions.every((question) => {
        if (question.type === "single" || question.type === "rating") {
          return question.answer !== null;
        } else if (question.type === "multiple") {
          return question.answer && question.answer.length > 0;
        }
        return true;
      });
      if (!allAnswered) {
        common_vendor.index.showToast({
          title: "请回答所有问题",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "提交中..."
      });
      questionnaire.value.status = "completed";
      const allQuestionnaires = JSON.parse(common_vendor.index.getStorageSync("questionnaires") || "[]");
      const index = allQuestionnaires.findIndex((q) => q.id === questionnaire.value.id);
      if (index !== -1) {
        allQuestionnaires[index] = JSON.parse(JSON.stringify(questionnaire.value));
      } else {
        allQuestionnaires.push(JSON.parse(JSON.stringify(questionnaire.value)));
      }
      common_vendor.index.setStorageSync("questionnaires", JSON.stringify(allQuestionnaires));
      common_vendor.index.hideLoading();
      common_vendor.index.showToast({
        title: "提交成功",
        icon: "success"
      });
      setTimeout(() => {
        common_vendor.index.navigateBack({
          delta: 1
        });
      }, 800);
    };
    const resetQuestionnaire = () => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要重新填写这份问卷吗？当前答案将被清空。",
        success: (res) => {
          if (res.confirm && questionnaire.value) {
            questionnaire.value.questions.forEach((question) => {
              question.answer = null;
            });
            questionnaire.value.status = "pending";
            const allQuestionnaires = JSON.parse(common_vendor.index.getStorageSync("questionnaires") || "[]");
            const index = allQuestionnaires.findIndex((q) => q.id === questionnaire.value.id);
            if (index !== -1) {
              allQuestionnaires[index] = JSON.parse(JSON.stringify(questionnaire.value));
              common_vendor.index.setStorageSync("questionnaires", JSON.stringify(allQuestionnaires));
            }
            common_vendor.index.showToast({
              title: "已重置问卷，可重新填写",
              icon: "none"
            });
          }
        }
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: questionnaire.value
      }, questionnaire.value ? {
        b: common_vendor.o(handleBack),
        c: common_vendor.t(questionnaire.value.title)
      } : {}, {
        d: questionnaire.value
      }, questionnaire.value ? {
        e: common_vendor.f(questionnaire.value.questions, (question, qIndex, i0) => {
          return {
            a: common_vendor.t(qIndex + 1),
            b: common_vendor.t(question.text),
            c: common_vendor.f(question.options, (option, oIndex, i1) => {
              return {
                a: common_vendor.t(option.text),
                b: oIndex,
                c: isOptionSelected(question.id, option.id) ? 1 : "",
                d: common_vendor.o(($event) => selectOption(question.id, option.id), oIndex)
              };
            }),
            d: qIndex
          };
        })
      } : {}, {
        f: questionnaire.value
      }, questionnaire.value ? common_vendor.e({
        g: questionnaire.value.status === "completed"
      }, questionnaire.value.status === "completed" ? {
        h: common_vendor.o(resetQuestionnaire)
      } : {}, {
        i: questionnaire.value.status !== "completed"
      }, questionnaire.value.status !== "completed" ? {
        j: common_vendor.o(submitQuestionnaire)
      } : {}) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-55b47ae9"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/questionnaire/questionnaire-detail.js.map
