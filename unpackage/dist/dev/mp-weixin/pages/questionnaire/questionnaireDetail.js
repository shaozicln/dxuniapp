"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request_request = require("../../utils/request/request.js");
const _sfc_main = {
  __name: "questionnaireDetail",
  setup(__props) {
    const questionnaire = common_vendor.ref(null);
    const submitting = common_vendor.ref(false);
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
    const submitScore = async (questionId, scoreValue) => {
      var _a;
      if (submitting.value)
        return;
      try {
        submitting.value = true;
        const now = /* @__PURE__ */ new Date();
        const scoreTime = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")} ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
        const scoreData = {
          scoreId: 1,
          targetId: 1,
          targetUserId: 1,
          questionnaireId: questionnaire.value.id,
          questionId,
          scoreValue,
          scoreLevel: scoreValue >= 8 ? "A" : scoreValue >= 6 ? "B" : scoreValue >= 4 ? "C" : "D",
          isModified: 0,
          scoreTime,
          lastModifyTime: scoreTime
        };
        common_vendor.index.__f__("log", "at pages/questionnaire/questionnaireDetail.vue:183", "提交的数据:", scoreData);
        const res = await utils_request_request.post("/question/score", scoreData);
        common_vendor.index.__f__("log", "at pages/questionnaire/questionnaireDetail.vue:185", "接口返回结果:", res);
        if (res.code === 200) {
          common_vendor.index.__f__("log", "at pages/questionnaire/questionnaireDetail.vue:188", `问题 ${questionId} 分数提交成功`, res.data);
          const question = questionnaire.value.questions.find((q) => q.id === questionId);
          if (question) {
            if (question.scoreId) {
              question.isModified = 1;
            } else {
              question.scoreId = (_a = res.data) == null ? void 0 : _a.scoreId;
            }
          }
        } else {
          common_vendor.index.showToast({
            title: `提交失败: ${res.msg || "未知错误"}`,
            icon: "none"
          });
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/questionnaire/questionnaireDetail.vue:205", "提交分数异常:", err);
        common_vendor.index.showToast({
          title: "网络错误，提交失败",
          icon: "none"
        });
      } finally {
        submitting.value = false;
      }
    };
    const selectOption = (questionId, optionId) => {
      if (!questionnaire.value)
        return;
      const question = questionnaire.value.questions.find((q) => q.id === questionId);
      if (!question)
        return;
      if (question.type === "single") {
        question.answer = optionId;
        const selectedOption = question.options.find((opt) => opt.id === optionId);
        if (selectedOption) {
          submitScore(questionId, selectedOption.value || 0);
        }
      } else if (question.type === "multiple") {
        if (!question.answer)
          question.answer = [];
        const index = question.answer.indexOf(optionId);
        if (index > -1) {
          question.answer.splice(index, 1);
        } else {
          question.answer.push(optionId);
        }
        const selectedOptions = question.options.filter((opt) => question.answer.includes(opt.id));
        const score = selectedOptions.length ? Math.round(selectedOptions.reduce((sum, opt) => sum + (opt.value || 0), 0) / selectedOptions.length) : 0;
        submitScore(questionId, score);
      }
    };
    const getStarScore = (star) => {
      return star * 2;
    };
    const selectStar = (questionId, star) => {
      if (!questionnaire.value)
        return;
      const question = questionnaire.value.questions.find((q) => q.id === questionId);
      if (question) {
        question.answer = star;
        const score = Math.round(star / 5 * 100);
        submitScore(questionId, score);
      }
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
      if (question) {
        question.answer = e.detail.value;
        const score = Math.round(e.detail.value / 10 * 100);
        submitScore(questionId, score);
      }
    };
    const submitQuestionnaire = async () => {
      if (!questionnaire.value || submitting.value)
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
      try {
        submitting.value = true;
        questionnaire.value.status = "completed";
        const allQuestionnaires = JSON.parse(common_vendor.index.getStorageSync("questionnaires") || "[]");
        const index = allQuestionnaires.findIndex((q) => q.id === questionnaire.value.id);
        if (index !== -1) {
          allQuestionnaires[index] = questionnaire.value;
        } else {
          allQuestionnaires.push(questionnaire.value);
        }
        common_vendor.index.setStorageSync("questionnaires", JSON.stringify(allQuestionnaires));
        common_vendor.index.showToast({
          title: "所有评分已提交",
          icon: "success"
        });
        setTimeout(() => common_vendor.index.navigateBack({
          delta: 1
        }), 800);
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/questionnaire/questionnaireDetail.vue:337", "提交问卷异常:", err);
        common_vendor.index.showToast({
          title: "提交失败，请重试",
          icon: "none"
        });
      } finally {
        submitting.value = false;
      }
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
        j: common_vendor.t(submitting.value ? "提交中..." : "提交问卷"),
        k: common_vendor.o(submitQuestionnaire),
        l: submitting.value
      } : {}) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c8f6d6a9"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/questionnaire/questionnaireDetail.js.map
