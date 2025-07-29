"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "questionnaire",
  setup(__props) {
    const questionnaires = common_vendor.reactive([
      {
        id: 1,
        title: "2025级新生入学调查问卷",
        grade: "基础级",
        description: "请新生填写个人基本信息和入学期望",
        date: "2025-09-01",
        status: "completed",
        questions: [
          {
            id: 101,
            text: "你的姓名是？",
            type: "single",
            options: [
              {
                id: 1001,
                text: "张三"
              },
              {
                id: 1002,
                text: "李四"
              },
              {
                id: 1003,
                text: "王五"
              },
              {
                id: 1004,
                text: "其他"
              }
            ],
            answer: 1001
          },
          {
            id: 102,
            text: "你选择的专业是？",
            type: "single",
            options: [
              {
                id: 1005,
                text: "计算机科学与技术"
              },
              {
                id: 1006,
                text: "软件工程"
              },
              {
                id: 1007,
                text: "物联网工程"
              },
              {
                id: 1008,
                text: "人工智能"
              }
            ],
            answer: 1006
          },
          {
            id: 103,
            text: "你对大学生活的期望是？",
            type: "multiple",
            options: [
              {
                id: 1009,
                text: "学习专业知识"
              },
              {
                id: 1010,
                text: "参加社团活动"
              },
              {
                id: 1011,
                text: "锻炼身体"
              },
              {
                id: 1012,
                text: "结交朋友"
              }
            ],
            answer: [1009, 1012]
          },
          {
            id: 104,
            text: "请对课程质量进行评分",
            type: "slider",
            min: 0,
            max: 10,
            step: 1,
            options: [
              {
                id: 4001,
                text: "极差",
                value: 0
              },
              {
                id: 4002,
                text: "较差",
                value: 2
              },
              {
                id: 4003,
                text: "一般",
                value: 5
              },
              {
                id: 4004,
                text: "良好",
                value: 8
              },
              {
                id: 4005,
                text: "优秀",
                value: 10
              }
            ],
            answer: 0
          }
        ]
      },
      {
        id: 2,
        title: "课程满意度调查问卷",
        grade: "进阶级",
        description: "对本学期已完成课程的评价和建议",
        date: "2023-12-15",
        status: "pending",
        questions: [
          {
            id: 201,
            text: "你对《数据结构》课程的满意度如何？",
            type: "rating",
            options: [
              {
                id: 2001,
                text: "非常满意"
              },
              {
                id: 2002,
                text: "满意"
              },
              {
                id: 2003,
                text: "一般"
              },
              {
                id: 2004,
                text: "不满意"
              },
              {
                id: 2005,
                text: "非常不满意"
              }
            ],
            answer: null
          },
          {
            id: 202,
            text: "你认为《数据结构》课程的教学方法是否有效？",
            type: "single",
            options: [
              {
                id: 2006,
                text: "非常有效"
              },
              {
                id: 2007,
                text: "有效"
              },
              {
                id: 2008,
                text: "一般"
              },
              {
                id: 2009,
                text: "无效"
              }
            ],
            answer: null
          },
          {
            id: 203,
            text: "你希望在下学期的课程中增加哪些内容？",
            type: "multiple",
            options: [
              {
                id: 2010,
                text: "更多实践项目"
              },
              {
                id: 2011,
                text: "案例分析"
              },
              {
                id: 2012,
                text: "小组讨论"
              },
              {
                id: 2013,
                text: "邀请行业专家讲座"
              }
            ],
            answer: null
          }
        ]
      },
      {
        id: 3,
        title: "校园生活质量调查问卷",
        grade: "高级",
        description: "对校园设施、服务和活动的评价",
        date: "2024-03-20",
        status: "pending",
        questions: [
          {
            id: 301,
            text: "你对学校食堂的满意度如何？",
            type: "rating",
            options: [
              {
                id: 3001,
                text: "非常满意"
              },
              {
                id: 3002,
                text: "满意"
              },
              {
                id: 3003,
                text: "一般"
              },
              {
                id: 3004,
                text: "不满意"
              },
              {
                id: 3005,
                text: "非常不满意"
              }
            ],
            answer: null
          },
          {
            id: 302,
            text: "你经常使用的校园设施有哪些？",
            type: "multiple",
            options: [
              {
                id: 3006,
                text: "图书馆"
              },
              {
                id: 3007,
                text: "体育馆"
              },
              {
                id: 3008,
                text: "自习室"
              },
              {
                id: 3009,
                text: "实验室"
              },
              {
                id: 3010,
                text: "食堂"
              }
            ],
            answer: null
          },
          {
            id: 303,
            text: "你希望学校增加哪些类型的校园活动？",
            type: "multiple",
            options: [
              {
                id: 3011,
                text: "学术讲座"
              },
              {
                id: 3012,
                text: "文化节"
              },
              {
                id: 3013,
                text: "体育比赛"
              },
              {
                id: 3014,
                text: "创新创业活动"
              },
              {
                id: 3015,
                text: "志愿者服务"
              }
            ],
            answer: null
          }
        ]
      }
    ]);
    const loadQuestionnaires = () => {
      const savedQuestionnaires = common_vendor.index.getStorageSync("questionnaires");
      if (savedQuestionnaires) {
        const loadedData = JSON.parse(savedQuestionnaires);
        questionnaires.splice(0, questionnaires.length);
        loadedData.forEach((item) => {
          questionnaires.push(item);
        });
      } else {
        common_vendor.index.setStorageSync("questionnaires", JSON.stringify(questionnaires));
      }
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
        return questionnaires;
      } else if (currentFilter.value === "pending") {
        return questionnaires.filter((q) => q.status === "pending");
      } else {
        return questionnaires.filter((q) => q.status === "completed");
      }
    });
    const navigateToDetail = (questionnaire) => {
      common_vendor.index.navigateTo({
        url: `/pages/questionnaire/questionnaire-detail?data=${encodeURIComponent(JSON.stringify(questionnaire))}`
      });
    };
    const handleBack = () => {
      common_vendor.index.navigateBack({
        delta: 1
        // 返回上一级页面
      });
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(handleBack),
        b: currentFilter.value === "all" ? 1 : "",
        c: common_vendor.o(($event) => currentFilter.value = "all"),
        d: currentFilter.value === "pending" ? 1 : "",
        e: common_vendor.o(($event) => currentFilter.value = "pending"),
        f: currentFilter.value === "completed" ? 1 : "",
        g: common_vendor.o(($event) => currentFilter.value = "completed"),
        h: common_vendor.f(filteredQuestionnaires.value, (questionnaire, index, i0) => {
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
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-57a88e77"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/questionnaire/questionnaire.js.map
