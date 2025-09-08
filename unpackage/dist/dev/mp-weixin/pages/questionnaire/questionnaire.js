"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request_request = require("../../utils/request/request.js");
if (!Math) {
  checkCourseQnr();
}
const checkCourseQnr = () => "./checkCourseQnr2.js";
const _sfc_main = {
  __name: "questionnaire",
  setup(__props) {
    const questionnaires = common_vendor.ref([]);
    const isInitialState = common_vendor.ref(true);
    const loadQuestionnaires = () => {
      const savedQuestionnaires = common_vendor.index.getStorageSync("questionnaires");
      if (savedQuestionnaires) {
        const loadedData = JSON.parse(savedQuestionnaires);
        questionnaires.value.splice(0, questionnaires.value.length);
        loadedData.forEach((item) => {
          questionnaires.value.push(item);
        });
        isInitialState.value = loadedData.length === 0;
      } else {
        common_vendor.index.setStorageSync("questionnaires", JSON.stringify(questionnaires));
      }
    };
    const fetchCourseQuestionnaires = async (courseNo, classSerial) => {
      try {
        common_vendor.index.showLoading({
          title: "获取问卷中..."
        });
        const res = await utils_request_request.get("/qnr/getCourseQnrCon", {
          courseNo,
          classSerial
        });
        common_vendor.index.hideLoading();
        if (res.code === 200) {
          common_vendor.index.__f__("log", "at pages/questionnaire/questionnaire.vue:103", res.data);
          const formattedData = res.data.map((item) => ({
            id: item.questionnaireId,
            title: item.questionnaireName,
            grade: "课程问卷",
            description: `课程: ${item.courseName} 教师: ${item.teacherName}`,
            date: (/* @__PURE__ */ new Date()).toLocaleDateString(),
            status: "pending",
            teacherName: item.teacherName,
            classSerial: item.classSerial,
            courseName: item.courseName,
            courseNo: item.courseNo,
            kclx: item.kclx,
            questions: item.questions.map((question) => ({
              id: question.id,
              text: question.name,
              type: mapQuestionType(question.scoringTypeId),
              qtype: question.questionTypeId,
              scoringTypeId: question.scoringTypeId,
              // 新增：保留评分类型ID用于详情页判断
              gmtype: question.gradingMethodId,
              options: getOptionsByType(question.scoringTypeId, question.questionTypeId),
              min: question.scoringTypeId === 3 ? 0 : question.scoringTypeId === 4 ? 1 : void 0,
              max: question.scoringTypeId === 3 ? 5 : question.scoringTypeId === 4 ? 10 : void 0,
              step: question.scoringTypeId === 4 ? 1 : void 0,
              answer: null,
              textAnswer: null
              // 文本框内容
            }))
          }));
          questionnaires.value = formattedData;
          common_vendor.index.setStorageSync("questionnaires", JSON.stringify(formattedData));
          isInitialState.value = false;
        } else {
          common_vendor.index.showToast({
            title: res.msg || "未找到相关问卷",
            icon: "none"
          });
        }
      } catch (err) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/questionnaire/questionnaire.vue:146", "获取课程问卷失败:", err);
        common_vendor.index.showToast({
          title: "获取问卷失败，请重试",
          icon: "none"
        });
      }
    };
    const mapQuestionType = (typeId) => {
      const typeMap = {
        1: "single",
        2: "multiple",
        3: "rating",
        4: "slider",
        5: "boolean",
        6: "text"
      };
      return typeMap[typeId] || "text";
    };
    const getOptionsByType = (scoringTypeId, questionTypeId) => {
      if (questionTypeId === 6) {
        return {
          type: "text",
          placeholder: "请输入文本..."
        };
      }
      if (questionTypeId === 4 && scoringTypeId === 5) {
        return [
          {
            id: 1,
            text: "是",
            value: 1
          },
          {
            id: 2,
            text: "否",
            value: 0
          }
        ];
      }
      if (scoringTypeId === 5 && questionTypeId !== 4) {
        return [
          {
            id: 1,
            text: "是",
            value: 1
          },
          {
            id: 2,
            text: "否",
            value: 0
          }
        ];
      }
      if (questionTypeId === 4) {
        switch (scoringTypeId) {
          case 5:
            return [
              {
                id: 1,
                text: "是",
                value: 1
              },
              {
                id: 2,
                text: "否",
                value: 0
              }
            ];
          case 6:
            return [];
          default:
            return [];
        }
      }
      switch (scoringTypeId) {
        case 1:
          return [
            {
              id: 1,
              text: "A  优",
              value: 10
            },
            {
              id: 2,
              text: "B  良",
              value: 8
            },
            {
              id: 3,
              text: "C  合格",
              value: 6
            },
            {
              id: 4,
              text: "D  不合格",
              value: 4
            }
          ];
        case 2:
          return [
            {
              id: 1,
              text: "A  选项A",
              value: 25
            },
            {
              id: 2,
              text: "B  选项B",
              value: 25
            },
            {
              id: 3,
              text: "C  选项C",
              value: 25
            },
            {
              id: 4,
              text: "D  选项D",
              value: 25
            }
          ];
        case 3:
          return {
            min: 0,
            max: 5
          };
        case 4:
          return {
            min: 1,
            max: 10,
            step: 1
          };
        case 5:
          return [
            {
              id: 1,
              text: "是",
              value: 1
            },
            {
              id: 2,
              text: "否",
              value: 0
            }
          ];
        default:
          return [];
      }
    };
    common_vendor.onMounted(() => {
      loadQuestionnaires();
    });
    common_vendor.onShow(() => {
      const savedQuestionnaires = common_vendor.index.getStorageSync("questionnaires");
      if (savedQuestionnaires) {
        const loadedData = JSON.parse(savedQuestionnaires);
        questionnaires.value = [...loadedData];
        isInitialState.value = loadedData.length === 0;
      }
    });
    const currentFilter = common_vendor.ref("all");
    const filteredQuestionnaires = common_vendor.computed(() => {
      if (currentFilter.value === "all") {
        return questionnaires.value;
      } else if (currentFilter.value === "pending") {
        return questionnaires.value.filter((q) => q.status === "pending");
      } else {
        return questionnaires.value.filter((q) => q.status === "completed");
      }
    });
    const navigateToDetail = (questionnaire) => {
      common_vendor.index.navigateTo({
        url: `/pages/questionnaire/questionnaireDetail?data=${encodeURIComponent(JSON.stringify(questionnaire))}`
      });
    };
    const handleBack = () => {
      common_vendor.index.setStorageSync("questionnaires", JSON.stringify(questionnaires.value));
      common_vendor.index.navigateBack({
        delta: 1
      });
    };
    const showCheckCourse = common_vendor.ref(false);
    const handleSelectCourse = (courseNo, classSerial) => {
      showCheckCourse.value = false;
      fetchCourseQuestionnaires(courseNo, classSerial);
      common_vendor.index.setStorageSync("currentCourse", JSON.stringify({
        courseNo,
        classSerial
      }));
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(handleBack),
        b: currentFilter.value === "all" ? 1 : "",
        c: common_vendor.o(($event) => currentFilter.value = "all"),
        d: currentFilter.value === "pending" ? 1 : "",
        e: common_vendor.o(($event) => currentFilter.value = "pending"),
        f: currentFilter.value === "completed" ? 1 : "",
        g: common_vendor.o(($event) => currentFilter.value = "completed"),
        h: isInitialState.value
      }, isInitialState.value ? {} : {
        i: common_vendor.f(filteredQuestionnaires.value, (questionnaire, index, i0) => {
          return {
            a: common_vendor.t(questionnaire.title),
            b: common_vendor.t(questionnaire.status === "completed" ? "已完成" : "未完成"),
            c: common_vendor.n(questionnaire.status === "completed" ? "status-completed" : "status-pending"),
            d: common_vendor.t(questionnaire.grade),
            e: common_vendor.t(questionnaire.date),
            f: common_vendor.t(questionnaire.description),
            g: index,
            h: common_vendor.o(($event) => navigateToDetail(questionnaire), index)
          };
        })
      }, {
        j: common_vendor.o(($event) => showCheckCourse.value = true),
        k: showCheckCourse.value
      }, showCheckCourse.value ? {
        l: common_vendor.o(($event) => showCheckCourse.value = false),
        m: common_vendor.o(handleSelectCourse),
        n: common_vendor.o(() => {
        }),
        o: common_vendor.o(($event) => showCheckCourse.value = false)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-57a88e77"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/questionnaire/questionnaire.js.map
