export const userInfoUtil = {
  initFromStorage(reactiveUserInfo) {
    try {
      const storedUserInfo = uni.getStorageSync('userInfo') || {};
      Object.keys(reactiveUserInfo).forEach(key => {
        if (storedUserInfo[key] !== undefined && storedUserInfo[key] !== '') {
          reactiveUserInfo[key] = storedUserInfo[key];
        }
      });
      let identity = '未登录';
      if (typeof storedUserInfo.userIdentity === 'string' && storedUserInfo.userIdentity) {
        identity = storedUserInfo.userIdentity;
      } 
      // 兼容逻辑：若没有 userIdentity，按 ID 类型推断
      else if (storedUserInfo.teacherID?.startsWith('Z')) {
        identity = '老师';
      } else if (storedUserInfo.studentID) {
        identity = '学生';
      }
      reactiveUserInfo.identity = identity;
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
        label: this.getIDLabel(userInfo.identity), 
        value: userInfo.teacherID || userInfo.studentID || '未设置', 
        canEdit: false 
      }
    ];
    // 学生额外显示班级、专业
    if (userInfo.identity === '学生') {
      baseItems.splice(4, 0, 
        { label: '班级', value: userInfo.className, canEdit: true },
        { label: '专业', value: userInfo.major, canEdit: true }
      );
    }
    if (['领导', '督导'].includes(userInfo.identity)) {
      baseItems.push({ label: '部门', value: userInfo.department || '未设置', canEdit: true });
    }
    return baseItems;
  },

  getIDLabel(identity) {
    const labels = {
      '教师': '教工号',
      '学生': '学号',
      '领导': '教工号',
      '督导': '教工号'
    };
    return labels[identity] || '编号';
  },

  getEditableFields(identity) {
    const baseFields = [
      { label: '性别', field: 'gender', type: 'select', options: ['男', '女', '保密'] },
      { label: '学院', field: 'college', type: 'input', placeholder: '请输入学院名称' }
    ];
    if (identity === '学生') {
      return [
        ...baseFields,
        { label: '班级', field: 'className', type: 'input', placeholder: '请输入班级（如计科2301）' },
        { label: '专业', field: 'major', type: 'input', placeholder: '请输入专业名称' }
      ];
    }
    return baseFields;
  }
};