// 用户信息管理工具
export const userInfoManager = {
  async initUserInfo(reactiveUserInfo) {
    try {
      // 环境兼容性检查
      if (typeof uni === 'undefined' || !uni.getStorageSync || !uni.showToast) {
        throw new Error('当前环境不支持UniApp核心API');
      }

      const storedUserInfo = uni.getStorageSync('userInfo');
      console.log('读取到的本地用户信息：', storedUserInfo);
      if (!storedUserInfo || typeof storedUserInfo !== 'object' || Array.isArray(storedUserInfo)) {
        console.warn('本地用户信息无效（非对象），使用默认值');
        return false;
      }

      // 合并存储数据到响应式对象
      this.mergeUserInfo(reactiveUserInfo, storedUserInfo);
      const derivedIdentity = this.deriveIdentity(storedUserInfo);
      reactiveUserInfo.identity = this.getValidIdentity(derivedIdentity);
      console.log('初始化后用户身份：', reactiveUserInfo.identity);
      return true;
    } catch (err) {
      console.error('用户信息初始化异常：', err.message || err);
      reactiveUserInfo.identity = '未登录';
      return false;
    }
  },

//合并用户信息
  mergeUserInfo(target, source) {
    Object.keys(target).forEach(key => {
      if (source[key] !== undefined && source[key] !== '' && source[key] !== null) {
        target[key] = source[key];
      }
    });
  },

//推导身份
  deriveIdentity(storedUserInfo) {
    let identity = '未登录';
    if (typeof storedUserInfo.userIdentity === 'string' && storedUserInfo.userIdentity.trim() !== '') {
      identity = storedUserInfo.userIdentity.trim();
    } 
    else {
      // 老师：teacherID 以 'Z' 开头
      if (storedUserInfo.teacherID?.startsWith('Z')) {
        identity = '老师';
      } 
      // 学生：存在非空 studentID
      else if (storedUserInfo.studentID && storedUserInfo.studentID.trim() !== '') {
        identity = '学生';
      }
    }
    return identity;
  },

  getValidIdentity(identity) {
    const validIdentities = ['领导', '督导', '教师', '学生', '未登录'];
    return validIdentities.includes(identity?.toString() || '') 
      ? identity 
      : '未登录';
  },

//对齐 userInfoUtil 的 getIDLabel 方法（获取身份对应的编号标签）
  getIDLabel(identity) {
    const labelMap = {
      '教师': '教工号',
      '学生': '学号',
      '领导': '教工号', 
      '督导': '教工号'  
    };
    return labelMap[identity] || '编号';
  },

//对齐 userInfoUtil 的 getEditableFields 方法（获取可编辑字段）
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