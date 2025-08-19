"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "questionnaireDetail",
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
      common_vendor.index.navigateBack({
        delta: 1
      });
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
    const getStarScore = (star) => {
      return star * 2;
    };
    const selectStar = (questionId, star) => {
      if (!questionnaire.value)
        return;
      const question = questionnaire.value.questions.find((q) => q.id === questionId);
      if (question)
        question.answer = star;
    };
    const getSliderPosition = (question) => {
      const value = question.answer || 1;
      const min = 1;
      const max = 10;
      const percent = (value - min) / (max - min) * 100;
      return `${Math.max(0, Math.min(100, percent))}%`;
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
        return question.answer !== null && question.answer !== void 0;
      });
      if (!allAnswered) {
        common_vendor.index.showToast({
          title: "请完成所有问题",
          icon: "none"
        });
        return;
      }
      const formattedQuestionnaire = JSON.parse(JSON.stringify(questionnaire.value));
      formattedQuestionnaire.questions.forEach((question) => {
        if (question.type === "rating") {
          question.actualScore = question.answer * 2;
        } else if (question.type === "slider") {
          question.actualScore = question.answer;
        }
      });
      common_vendor.index.showLoading({
        title: "提交中..."
      });
      formattedQuestionnaire.status = "completed";
      const allQuestionnaires = JSON.parse(common_vendor.index.getStorageSync("questionnaires") || "[]");
      const index = allQuestionnaires.findIndex((q) => q.id === formattedQuestionnaire.id);
      if (index !== -1) {
        allQuestionnaires[index] = formattedQuestionnaire;
      } else {
        allQuestionnaires.push(formattedQuestionnaire);
      }
      common_vendor.index.setStorageSync("questionnaires", JSON.stringify(allQuestionnaires));
      common_vendor.index.hideLoading();
      common_vendor.index.showToast({
        title: "提交成功",
        icon: "success"
      });
      setTimeout(() => common_vendor.index.navigateBack({
        delta: 1
      }), 800);
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
            common_vendor.index.showToast({
              title: "已重置，可重新填写",
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
            h: common_vendor.f(5, (star, k1, i1) => {
              return {
                a: common_vendor.t(getStarScore(star)),
                b: star,
                c: question.answer !== null && star <= question.answer ? 1 : "",
                d: common_vendor.o(($event) => selectStar(question.id, star), star)
              };
            })
          } : {}, {
            i: question.type === "slider"
          }, question.type === "slider" ? {
            j: common_vendor.t(question.answer),
            k: getSliderPosition(question),
            l: question.answer || 1,
            m: common_vendor.o(($event) => handleSliderChanging(question.id, $event), qIndex),
            n: common_vendor.o(($event) => handleSliderChange(question.id, $event), qIndex)
          } : {}, {
            o: qIndex
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
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c8f6d6a9"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/questionnaire/questionnaireDetail.js.map
