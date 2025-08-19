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
    const showFilter = common_vendor.ref(false);
    const filterText = common_vendor.ref("");
    const filteredCourses = common_vendor.computed(() => {
      if (!filterText.value)
        return courses.value;
      return courses.value.filter(
        (course) => course.courseName.includes(filterText.value) || course.teacherName.includes(filterText.value)
      );
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
        const res = await utils_request_request.get("/teaching_info/classInfo/list");
        if (res.code === 200) {
          courses.value = res.rows || [];
          common_vendor.index.__f__("log", "at pages/questionnaire/checkCourseQnr.vue:95", "获取课程成功，数据长度:", ((_a = res.rows) == null ? void 0 : _a.length) || 0);
        } else {
          error.value = `获取失败: ${res.msg || "未知错误"}`;
        }
      } catch (err) {
        error.value = "网络错误，请检查接口是否可用";
        common_vendor.index.__f__("error", "at pages/questionnaire/checkCourseQnr.vue:102", "请求异常:", err);
        loading.value = false;
      }
    };
    const handleCourseClick = (course) => {
      emit("selectCourse", course.courseNo, course.classSerial);
    };
    const showDetail = (course) => {
      currentDetail.value = {
        ...course
      };
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(($event) => showFilter.value = !showFilter.value),
        b: common_vendor.f(filteredCourses.value, (course, k0, i0) => {
          return {
            a: common_vendor.t(course.courseName),
            b: common_vendor.t(course.teacherName),
            c: common_vendor.o(($event) => showDetail(course), course.id),
            d: course.id,
            e: common_vendor.o(($event) => handleCourseClick(course), course.id)
          };
        }),
        c: currentDetail.value
      }, currentDetail.value ? {
        d: common_vendor.t(currentDetail.value.courseName),
        e: common_vendor.t(currentDetail.value.courseNo),
        f: common_vendor.t(currentDetail.value.classSerial),
        g: common_vendor.t(currentDetail.value.courseCollege),
        h: common_vendor.t(currentDetail.value.courseType),
        i: common_vendor.t(currentDetail.value.academicTerm),
        j: common_vendor.o(($event) => currentDetail.value = null)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-94c4d16a"]]);
exports.MiniProgramPage = MiniProgramPage;
//# sourceMappingURL=../.sourcemap/mp-weixin/checkCourseQnr.js.map
