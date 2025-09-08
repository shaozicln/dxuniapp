"use strict";
const common_vendor = require("./common/vendor.js");
const utils_request_request = require("./utils/request/request.js");
const _sfc_main = {
  __name: "checkCourseQnr",
  emits: ["close", "selectCourse"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const courses = common_vendor.ref([]);
    const loading = common_vendor.ref(false);
    const error = common_vendor.ref("");
    const currentCollege = common_vendor.ref("");
    const allColleges = common_vendor.computed(() => {
      const colleges = /* @__PURE__ */ new Set();
      courses.value.forEach((course) => {
        if (course.courseCollege) {
          colleges.add(course.courseCollege);
        }
      });
      return Array.from(colleges);
    });
    common_vendor.ref(false);
    const filterText = common_vendor.ref("");
    const filteredColleges = common_vendor.computed(() => {
      if (!filterText.value)
        return allColleges.value;
      return allColleges.value.filter(
        (college) => college.includes(filterText.value)
      );
    });
    const filteredCourses = common_vendor.computed(() => {
      if (!currentCollege.value)
        return [];
      return courses.value.filter((course) => course.courseCollege === currentCollege.value);
    });
    const currentDetail = common_vendor.ref(null);
    common_vendor.onMounted(() => {
      fetchCourses();
    });
    const fetchCourses = async () => {
      var _a;
      try {
        loading.value = true;
        error.value = "";
        common_vendor.index.__f__("log", "at pages/questionnaire/checkCourseQnr.vue:108", "开始请求课程数据");
        const res = await utils_request_request.get("/teaching_info/classInfo/list");
        common_vendor.index.__f__("log", "at pages/questionnaire/checkCourseQnr.vue:110", "请求返回结果:", res);
        if (res.code === 200) {
          courses.value = res.rows || [];
          common_vendor.index.__f__("log", "at pages/questionnaire/checkCourseQnr.vue:114", "获取课程成功，数据长度:", ((_a = res.rows) == null ? void 0 : _a.length) || 0);
        } else {
          error.value = `获取失败: ${res.msg || "未知错误"}`;
        }
      } catch (err) {
        error.value = "网络错误，请检查接口是否可用";
        common_vendor.index.__f__("error", "at pages/questionnaire/checkCourseQnr.vue:121", "请求异常:", err);
      } finally {
        loading.value = false;
      }
    };
    const getCourseCountByCollege = (college) => {
      return courses.value.filter((course) => course.courseCollege === college).length;
    };
    const handleCollegeClick = (college) => {
      currentCollege.value = college;
    };
    const handleBack = () => {
      currentCollege.value = "";
    };
    const handleCourseClick = (course) => {
      emit("selectCourse", course.courseNo, course.classSerial);
    };
    const showDetail = (course) => {
      currentDetail.value = { ...course };
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(currentCollege.value ? currentCollege.value : "选择学院"),
        b: currentCollege.value
      }, currentCollege.value ? {
        c: common_vendor.o(handleBack)
      } : {}, {
        d: !currentCollege.value
      }, !currentCollege.value ? {
        e: common_vendor.f(filteredColleges.value, (college, k0, i0) => {
          return {
            a: common_vendor.t(college),
            b: common_vendor.t(getCourseCountByCollege(college)),
            c: college,
            d: common_vendor.o(($event) => handleCollegeClick(college), college)
          };
        })
      } : {}, {
        f: currentCollege.value
      }, currentCollege.value ? {
        g: common_vendor.f(filteredCourses.value, (course, k0, i0) => {
          return {
            a: common_vendor.t(course.courseName),
            b: common_vendor.t(course.teacherName),
            c: common_vendor.o(($event) => showDetail(course), course.id),
            d: course.id,
            e: common_vendor.o(($event) => handleCourseClick(course), course.id)
          };
        })
      } : {}, {
        h: currentDetail.value
      }, currentDetail.value ? {
        i: common_vendor.t(currentDetail.value.courseName),
        j: common_vendor.t(currentDetail.value.courseNo),
        k: common_vendor.t(currentDetail.value.classSerial),
        l: common_vendor.t(currentDetail.value.courseCollege),
        m: common_vendor.t(currentDetail.value.courseType),
        n: common_vendor.t(currentDetail.value.academicTerm),
        o: common_vendor.o(($event) => currentDetail.value = null)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-94c4d16a"]]);
exports.MiniProgramPage = MiniProgramPage;
//# sourceMappingURL=../.sourcemap/mp-weixin/checkCourseQnr.js.map
