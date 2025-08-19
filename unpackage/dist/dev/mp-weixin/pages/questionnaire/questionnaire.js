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
          questionnaires.push(item);
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
          const formattedData = res.data.map((item) => ({
            id: item.questionnaireId,
            title: item.questionnaireName,
            grade: "课程问卷",
            // 可根据实际需求调整
            description: `课程: ${item.courseName} 教师: ${item.teacherName}`,
            date: (/* @__PURE__ */ new Date()).toLocaleDateString(),
            // 使用当前日期或接口返回的日期
            status: "pending",
            // 默认为未完成状态
            questions: item.questions.map((question) => ({
              id: question.id,
              text: question.name,
              type: mapQuestionType(question.scoringTypeId),
              //options: getDefaultOptions(question.scoringTypeId),
              // 为滑动条和星级设置范围属性
              min: question.scoringTypeId === 3 ? 0 : question.scoringTypeId === 4 ? 1 : void 0,
              max: question.scoringTypeId === 3 ? 5 : question.scoringTypeId === 4 ? 10 : void 0,
              step: question.scoringTypeId === 4 ? 1 : void 0,
              answer: null
            }))
          }));
          questionnaires.value = formattedData;
          common_vendor.index.__f__("log", "at pages/questionnaire/questionnaire.vue:139", questionnaires.value);
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
        common_vendor.index.__f__("error", "at pages/questionnaire/questionnaire.vue:153", "获取课程问卷失败:", err);
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
        4: "slider"
      };
      return typeMap[typeId] || "single";
    };
    common_vendor.onMounted(() => {
      loadQuestionnaires();
    });
    common_vendor.onShow(() => {
      loadQuestionnaires();
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
      common_vendor.index.navigateBack({
        delta: 1
        // 返回上一级页面
      });
    };
    const showCheckCourse = common_vendor.ref(false);
    const handleSelectCourse = (courseNo, classSerial) => {
      showCheckCourse.value = false;
      fetchCourseQuestionnaires(courseNo, classSerial);
      common_vendor.index.__f__("log", "at pages/questionnaire/questionnaire.vue:269", "选中课程：", courseNo, classSerial);
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
