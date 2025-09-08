"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request_request = require("../../utils/request/request.js");
const _sfc_main = {
  __name: "questionnaireDetail",
  setup(__props) {
    const questionnaire = common_vendor.ref(null);
    const submitting = common_vendor.ref(false);
    common_vendor.ref(JSON.parse(common_vendor.index.getStorageSync("currentCourse") || "{}"));
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
            if (question.answer === null || question.answer === void 0) {
              if (question.type === "slider") {
                question.answer = question.min || 0;
              } else if (question.type === "rating") {
                question.answer = 0;
              }
            }
            if (question.textAnswer === void 0) {
              question.textAnswer = "";
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
    const getQuestionTag = (question) => {
      switch (question.scoringTypeId) {
        case 1:
          return "[单选题]";
        case 2:
          return "[多选题]";
        case 3:
          return "[打星题]";
        case 4:
          return "[滑动打分题]";
        case 5:
          return "[反馈问题指标题]";
        case 6:
          return "[文本题]";
        default:
          return "";
      }
    };
    const isBooleanQuestion = (question) => {
      return question.type === "boolean" || question.qtype === 4 && question.scoringTypeId === 5;
    };
    const isOptionSelected = (questionId, optionId) => {
      var _a;
      if (!questionnaire.value)
        return false;
      const question = questionnaire.value.questions.find((q) => q.id === questionId);
      if (!question || !question.answer)
        return false;
      return question.type === "single" || question.type === "boolean" ? question.answer === optionId : (_a = question.answer) == null ? void 0 : _a.includes(optionId);
    };
    const handleTextInput = (questionId, e) => {
      if (!questionnaire.value)
        return;
      const question = questionnaire.value.questions.find((q) => q.id === questionId);
      if (question) {
        question.textAnswer = e.detail.value;
      }
    };
    const selectOption = (questionId, optionId) => {
      if (!questionnaire.value)
        return;
      const question = questionnaire.value.questions.find((q) => q.id === questionId);
      if (!question)
        return;
      if (question.type === "single" || question.type === "boolean") {
        question.answer = optionId;
        question.options.find((opt) => opt.id === optionId);
      } else if (question.type === "multiple") {
        if (!question.answer)
          question.answer = [];
        const index = question.answer.indexOf(optionId);
        if (index > -1) {
          question.answer.splice(index, 1);
        } else {
          question.answer.push(optionId);
        }
        question.options.filter((opt) => question.answer.includes(opt.id));
      }
    };
    const selectStar = (questionId, star) => {
      if (!questionnaire.value)
        return;
      const question = questionnaire.value.questions.find((q) => q.id === questionId);
      if (question) {
        question.answer = star;
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
      }
    };
    const getStarScore = (star) => {
      return star * 2;
    };
    const userInfo = common_vendor.index.getStorageSync("userInfo") || "[]";
    const calculateTotalScore = () => {
      let total = 0;
      questionnaire.value.questions.forEach((question) => {
        if (question.type === "single") {
          const selectedOption = question.options.find((opt) => opt.id === question.answer);
          total += (selectedOption == null ? void 0 : selectedOption.value) || 0;
        }
      });
      return total;
    };
    const getScoreLevel = (score) => {
      if (!score)
        return null;
      if (score === 10)
        return "A";
      if (score === 8)
        return "B";
      if (score === 6)
        return "C";
      if (score === 4)
        return "D";
      return "E";
    };
    const submitQuestionnaire = async () => {
      if (!questionnaire.value || submitting.value)
        return;
      const allAnswered = questionnaire.value.questions.every((question) => {
        if (question.qtype === 3)
          return true;
        if (question.qtype === 4) {
          if (question.scoringTypeId === 5) {
            if (question.answer === null || question.answer === void 0)
              return false;
            return question.answer !== 1 || question.textAnswer && question.textAnswer.trim() !== "";
          }
          if (question.scoringTypeId === 6) {
            return question.textAnswer && question.textAnswer.trim() !== "";
          }
        }
        return question.answer !== null && question.answer !== void 0 && (question.type !== "multiple" || question.answer.length > 0);
      });
      if (!allAnswered) {
        common_vendor.index.showToast({
          title: "请完成所有必填问题",
          icon: "none"
        });
        return;
      }
      try {
        submitting.value = true;
        const submitData = {
          mainData: {
            questionnaireId: questionnaire.value.id,
            publishId: questionnaire.value.publishId || "202305001",
            academicYearSemester: questionnaire.value.academicYearSemester || "2025-2026学年 第一学期",
            questionnaireName: questionnaire.value.title,
            questionnaireType: "课程评估",
            questionnaireCategory: "",
            evalType: "绩效评估",
            evalTarget: "课堂教师",
            evaluationRequirement: "必修课评估",
            kclx: questionnaire.value.kclx,
            skdd: questionnaire.value.skdd,
            courseNo: questionnaire.value.courseNo,
            classSerial: questionnaire.value.classSerial,
            courseName: questionnaire.value.courseName,
            studentClass: "",
            courseDepartment: "",
            teacherId: "T1001",
            teacherName: questionnaire.value.teacherName,
            teacherDepartment: "计算机学院",
            teacherTitle: "副教授",
            evaluatorId: userInfo.teacherId,
            evaluatorName: userInfo.name,
            evaluatorType: "教师",
            evaluatorDepartment: "计算机学院",
            totalScore: 100,
            obtainedScore: calculateTotalScore(),
            evaluationTime: "2024-03-15T14:30:00"
          },
          targetScores: questionnaire.value.questions.map((question) => {
            let scoreValue = null;
            let singleChoice = null;
            let fillInBlank = null;
            if (question.type === "slider") {
              scoreValue = question.answer;
            } else if (question.type === "rating") {
              scoreValue = question.answer * 2;
            } else if (question.type === "single" || question.type === "boolean") {
              singleChoice = question.answer;
              const selectedOption = question.options.find((opt) => opt.id === question.answer);
              if (selectedOption && selectedOption.value) {
                scoreValue = selectedOption.value;
              }
            } else if (question.type === "multiple") {
              const selectedOptions = question.options.filter((opt) => question.answer.includes(opt.id));
              if (selectedOptions.length > 0) {
                scoreValue = Math.round(selectedOptions.reduce((sum, opt) => sum + (opt.value || 0), 0) / selectedOptions.length);
              }
            } else if (question.textAnswer) {
              fillInBlank = question.textAnswer;
            }
            return {
              targetUserId: userInfo.teacherId || "",
              // 被评估教师ID
              scoreLevel: getScoreLevel(scoreValue),
              // 计算评分等级
              questionnaireId: questionnaire.value.id,
              questionId: question.id,
              gradingMethodId: question.gmtype || 1,
              scoreValue,
              singleChoice,
              fillInBlank,
              scoreTime: (/* @__PURE__ */ new Date()).toISOString()
            };
          })
        };
        const res = await utils_request_request.post("/result/submit", submitData);
        if (res.code === 200) {
          questionnaire.value.status = "completed";
          common_vendor.index.__f__("log", "at pages/questionnaire/questionnaireDetail.vue:423", "ok");
          const allQuestionnaires = JSON.parse(common_vendor.index.getStorageSync("questionnaires") || "[]");
          const index = allQuestionnaires.findIndex((q) => q.id === questionnaire.value.id);
          if (index !== -1) {
            allQuestionnaires[index] = questionnaire.value;
          } else {
            allQuestionnaires.push(questionnaire.value);
          }
          common_vendor.index.setStorageSync("questionnaires", JSON.stringify(allQuestionnaires));
          common_vendor.index.showToast({
            title: "问卷提交成功",
            icon: "success"
          });
          setTimeout(() => common_vendor.index.navigateBack({
            delta: 1
          }), 800);
        } else {
          common_vendor.index.showToast({
            title: `提交失败: ${res.msg || "未知错误"}`,
            icon: "none"
          });
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/questionnaire/questionnaireDetail.vue:450", "提交问卷异常:", err);
        common_vendor.index.showToast({
          title: "网络错误，提交失败",
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
              question.textAnswer = "";
              if (question.type === "slider") {
                question.answer = question.min || 0;
              } else if (question.type === "rating") {
                question.answer = 0;
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
            b: common_vendor.t(getQuestionTag(question)),
            c: common_vendor.t(question.text),
            d: question.type === "single"
          }, question.type === "single" ? {
            e: common_vendor.f(question.options, (option, oIndex, i1) => {
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
            f: question.type === "multiple"
          }, question.type === "multiple" ? {
            g: common_vendor.f(question.options, (option, oIndex, i1) => {
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
            h: question.type === "rating"
          }, question.type === "rating" ? {
            i: common_vendor.f(5, (star, k1, i1) => {
              return {
                a: common_vendor.t(getStarScore(star)),
                b: star,
                c: question.answer !== null && star <= question.answer ? 1 : "",
                d: common_vendor.o(($event) => selectStar(question.id, star), star)
              };
            })
          } : {}, {
            j: question.type === "slider"
          }, question.type === "slider" ? {
            k: common_vendor.t(question.answer),
            l: getSliderPosition(question),
            m: question.answer || 1,
            n: common_vendor.o(($event) => handleSliderChanging(question.id, $event), qIndex),
            o: common_vendor.o(($event) => handleSliderChange(question.id, $event), qIndex)
          } : {}, {
            p: isBooleanQuestion(question)
          }, isBooleanQuestion(question) ? {
            q: common_vendor.f(question.options, (option, oIndex, i1) => {
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
            r: question.qtype === 4 && question.scoringTypeId === 5 && isOptionSelected(question.id, 1)
          }, question.qtype === 4 && question.scoringTypeId === 5 && isOptionSelected(question.id, 1) ? {
            s: common_vendor.o([($event) => question.textAnswer = $event.detail.value, ($event) => handleTextInput(question.id, $event)], qIndex),
            t: question.textAnswer
          } : {}, {
            v: question.qtype === 4 && question.scoringTypeId === 6
          }, question.qtype === 4 && question.scoringTypeId === 6 ? {
            w: common_vendor.o([($event) => question.textAnswer = $event.detail.value, ($event) => handleTextInput(question.id, $event)], qIndex),
            x: question.textAnswer
          } : {}, {
            y: qIndex
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
