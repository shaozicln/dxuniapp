// 用户信息处理工具
export const userInfoUtil = {
  initFromStorage(reactiveUserInfo) {
    try {
      const storedUserInfo = uni.getStorageSync('userInfo') || {};
      // 合并本地存储数据到响应式对象（空值不覆盖）
      Object.keys(reactiveUserInfo).forEach(key => {
        if (storedUserInfo[key] !== undefined && storedUserInfo[key] !== '') {
          reactiveUserInfo[key] = storedUserInfo[key];
        }
      });
      // 自动判定身份（老师/学生）
      reactiveUserInfo.identity = storedUserInfo.teacherID?.startsWith('Z') 
        ? '老师' 
        : (storedUserInfo.studentID ? '学生' : '未登录');
      return reactiveUserInfo;
    } catch (err) {
      console.error('userInfoUtil: 初始化用户信息失败', err);
      uni.showToast({ title: '信息加载失败', icon: 'none' });
      return reactiveUserInfo;
    }
  },

  generateInfoList(userInfo) {
    let baseItems = [
      { label: '姓名', value: userInfo.name, canEdit: false },
      { label: '身份', value: userInfo.identity, canEdit: false },
      { label: '性别', value: userInfo.gender, canEdit: true },
      { label: '学院', value: userInfo.college, canEdit: true },
      { 
        label: userInfo.identity === '老师' ? '教工号' : '学号', 
        value: userInfo.teacherID|| userInfo.studentID || '未设置', 
        canEdit: false 
      }
    ];
    // 学生额外显示班级、专业
    if (userInfo.identity !== '老师') {
      baseItems.splice(4, 0, 
        { label: '班级', value: userInfo.className, canEdit: true },
        { label: '专业', value: userInfo.major, canEdit: true }
      );
    }
    return baseItems;
  },

  getEditableFields(identity) {
    const allFields = [
      { label: '性别', field: 'gender', type: 'select', options: ['男', '女', '保密'] },
      { label: '学院', field: 'college', type: 'input', placeholder: '请输入学院名称' },
      { label: '班级', field: 'className', type: 'input', placeholder: '请输入班级（如计科2301）' },
      { label: '专业', field: 'major', type: 'input', placeholder: '请输入专业名称' },
    ];
    return identity === '老师' 
      ? allFields.filter(f => !['班级', '专业'].includes(f.label)) 
      : allFields;
  }
};