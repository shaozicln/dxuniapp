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
        questionnaire.value = storedQuestionnaire || currentQuestionnaire;
        if (questionnaire.value) {
          questionnaire.value.questions.forEach((question) => {
            if (question.type === "slider" && question.answer === null) {
              question.answer = question.min || 0;
            }
          });
        }
      } else {
        common_vendor.index.navigateBack();
      }
    });
    const handleBack = () => {
      common_vendor.index.navigateBack({ delta: 1 });
    };
    const isOptionSelected = (questionId, optionId) => {
      var _a;
      if (!questionnaire.value)
        return false;
      const question = questionnaire.value.questions.find((q) => q.id === questionId);
      if (!question || !question.answer)
        return false;
      return question.type === "single" ? question.answer === optionId : (_a = question.answer) == null ? void 0 : _a.includes(optionId);
    };
    const selectOption = (questionId, optionId) => {
      if (!questionnaire.value)
        return;
      const question = questionnaire.value.questions.find((q) => q.id === questionId);
      if (!question)
        return;
      if (question.type === "single") {
        question.answer = optionId;
      } else if (question.type === "multiple") {
        if (!question.answer)
          question.answer = [];
        const index = question.answer.indexOf(optionId);
        if (index > -1) {
          question.answer.splice(index, 1);
        } else {
          question.answer.push(optionId);
        }
      }
    };
    const isStarSelected = (questionId, index) => {
      if (!questionnaire.value)
        return false;
      const question = questionnaire.value.questions.find((q) => q.id === questionId);
      if (!question || question.answer === null)
        return false;
      const optionIndex = question.options.findIndex((opt) => opt.id === question.answer);
      return index <= optionIndex;
    };
    const selectStar = (questionId, optionId, index) => {
      if (!questionnaire.value)
        return;
      const question = questionnaire.value.questions.find((q) => q.id === questionId);
      if (question)
        question.answer = optionId;
    };
    const getSliderPosition = (question) => {
      if (question.answer === null)
        question.answer = question.min || 0;
      const value = question.answer;
      const min = question.min || 0;
      const max = question.max || 10;
      const percent = (value - min) / (max - min) * 100;
      return `${Math.max(0, Math.min(100, percent))}%`;
    };
    const getSliderText = (question) => {
      if (question.answer === null)
        question.answer = question.min || 0;
      const matchedOption = question.options.find((opt) => opt.value === question.answer);
      return (matchedOption == null ? void 0 : matchedOption.text) || question.answer;
    };
    const handleSliderChanging = (questionId, e) => {
      if (!questionnaire.value)
        return;
      const question = questionnaire.value.questions.find((q) => q.id === questionId);
      if (question)
        question.answer = e.detail.value;
    };
    const handleSliderChange = (questionId, e) => {
      if (!questionnaire.value)
        return;
      const question = questionnaire.value.questions.find((q) => q.id === questionId);
      if (question)
        question.answer = e.detail.value;
    };
    const submitQuestionnaire = () => {
      if (!questionnaire.value)
        return;
      const allAnswered = questionnaire.value.questions.every((question) => {
        if (question.type === "slider") {
          return question.answer !== null;
        } else if (question.type === "single" || question.type === "rating") {
          return question.answer !== null;
        } else if (question.type === "multiple") {
          return question.answer && question.answer.length > 0;
        }
        return true;
      });
      if (!allAnswered) {
        common_vendor.index.showToast({ title: "请完成所有问题", icon: "none" });
        return;
      }
      common_vendor.index.showLoading({ title: "提交中..." });
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
      common_vendor.index.showToast({ title: "提交成功", icon: "success" });
      setTimeout(() => common_vendor.index.navigateBack({ delta: 1 }), 800);
    };
    const resetQuestionnaire = () => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定重新填写？当前答案将清空",
        success: (res) => {
          if (res.confirm && questionnaire.value) {
            questionnaire.value.questions.forEach((question) => {
              question.answer = null;
              if (question.type === "slider") {
                question.answer = question.min || 0;
              }
            });
            questionnaire.value.status = "pending";
            const allQuestionnaires = JSON.parse(common_vendor.index.getStorageSync("questionnaires") || "[]");
            const index = allQuestionnaires.findIndex((q) => q.id === questionnaire.value.id);
            if (index !== -1) {
              allQuestionnaires[index] = JSON.parse(JSON.stringify(questionnaire.value));
              common_vendor.index.setStorageSync("questionnaires", JSON.stringify(allQuestionnaires));
            }
            common_vendor.index.showToast({ title: "已重置，可重新填写", icon: "none" });
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
          var _a, _b;
          return common_vendor.e({
            a: common_vendor.t(qIndex + 1),
            b: common_vendor.t(question.text),
            c: question.type === "single"
          }, question.type === "single" ? {
            d: common_vendor.f(question.options, (option, oIndex, i1) => {
              return common_vendor.e({
                a: isOptionSelected(question.id, option.id)
              }, isOptionSelected(question.id, option.id) ? {} : {}, {
                b: common_vendor.t(option.text),
                c: oIndex,
                d: isOptionSelected(question.id, option.id) ? 1 : "",
                e: common_vendor.o(($event) => selectOption(question.id, option.id), oIndex)
              });
            })
          } : {}, {
            e: question.type === "multiple"
          }, question.type === "multiple" ? {
            f: common_vendor.f(question.options, (option, oIndex, i1) => {
              return common_vendor.e({
                a: isOptionSelected(question.id, option.id)
              }, isOptionSelected(question.id, option.id) ? {} : {}, {
                b: common_vendor.t(option.text),
                c: oIndex,
                d: isOptionSelected(question.id, option.id) ? 1 : "",
                e: common_vendor.o(($event) => selectOption(question.id, option.id), oIndex)
              });
            })
          } : {}, {
            g: question.type === "rating"
          }, question.type === "rating" ? {
            h: common_vendor.f(question.options, (option, oIndex, i1) => {
              return {
                a: common_vendor.t(option.text),
                b: oIndex,
                c: isStarSelected(question.id, oIndex) ? 1 : "",
                d: common_vendor.o(($event) => selectStar(question.id, option.id), oIndex)
              };
            })
          } : {}, {
            i: question.type === "slider"
          }, question.type === "slider" ? {
            j: common_vendor.t(getSliderText(question)),
            k: getSliderPosition(question),
            l: question.min || 0,
            m: question.max || 10,
            n: question.step || 1,
            o: question.answer !== null ? question.answer : question.min || 0,
            p: common_vendor.o(($event) => handleSliderChanging(question.id, $event), qIndex),
            q: common_vendor.o(($event) => handleSliderChange(question.id, $event), qIndex),
            r: common_vendor.t(((_a = question.options[0]) == null ? void 0 : _a.text) || "最低"),
            s: common_vendor.t(((_b = question.options[question.options.length - 1]) == null ? void 0 : _b.text) || "最高")
          } : {}, {
            t: qIndex
          });
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
