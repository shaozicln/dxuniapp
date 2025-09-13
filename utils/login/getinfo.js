import { get } from '../request/request.js';
export const getInfo = {
  // 登出清理方法：补充清理 userInfo 中的身份信息，确保状态彻底重置
  _clearLoginState(redirectCb) {
    uni.removeStorageSync('autoToken');
    uni.removeStorageSync('token');
    uni.removeStorageSync('userIdentity');
    const existingUserInfo = uni.getStorageSync('userInfo') || {};
    if (existingUserInfo.userIdentity) {
      delete existingUserInfo.userIdentity;
      uni.setStorageSync('userInfo', existingUserInfo);
    }
    uni.removeStorageSync('isLogin');
    redirectCb && redirectCb();
  },

  async _handleGetInfoRequest(redirectCb) {
    try {
      // 获取本地 Token
      const token = uni.getStorageSync('autoToken') || uni.getStorageSync('token');
      if (!token) {
        console.warn('getInfo: 本地无有效Token，需重新登录');
        this._clearLoginState(redirectCb);
        return;
      }

      // 发起接口请求
      const res = await get(
        'https://jxpj.neau.edu.cn/api/v1/getInfo',
        { headers: { 'Authorization': `${token}` } }
      );

      // 响应格式校验
      if (!res || typeof res.code === 'undefined') {
        console.error('getInfo: 接口返回格式异常', res);
        uni.showToast({ title: '获取身份信息失败：接口格式错误', icon: 'none', duration: 2000 });
        return;
      }

      // 业务逻辑处理
      if (res.code === 200) {
        if (!Array.isArray(res.roles) || res.roles.length === 0) {
          console.error('getInfo: 角色信息缺失或格式错误', res);
          uni.showToast({ title: '获取身份信息失败：角色数据无效', icon: 'none', duration: 2000 });
          this._clearLoginState(redirectCb);
          return;
        }
        let userIdentity = '';
        if (res.roles.includes('leader')) {
          userIdentity = '领导';
        } else if (res.roles.includes('supervisor')) {
          userIdentity = '督导';
        } else if (res.roles.includes('teacher')) {
          userIdentity = '教师'; 
        } else if (res.roles.includes('student')) {
          userIdentity = '学生';
        } else {
          console.warn('getInfo: 不支持的用户角色', res.roles);
          uni.showToast({ title: '当前身份不允许登录', icon: 'none', duration: 2000 });
          this._clearLoginState(redirectCb);
          return;
        }
        const existingUserInfo = uni.getStorageSync('userInfo') || {};
        const updatedUserInfo = {
          ...existingUserInfo,
          userIdentity: userIdentity, 
          roles: res.roles 
        };
        uni.setStorageSync('userInfo', updatedUserInfo); 
        uni.setStorageSync('isLogin', true);
        uni.setStorageSync('userIdentity', userIdentity);
        
        console.log('getInfo: 身份信息获取成功', { userIdentity, updatedUserInfo });

      } else {
        console.warn('getInfo: 获取身份信息失败', { code: res.code, msg: res.msg });
        uni.showToast({
          title: res.msg || `获取失败（错误码：${res.code}）`,
          icon: 'none',
          duration: 2000
        });

        // Token失效处理
        if (res.code === 401) {
          this._clearLoginState(redirectCb);
        }
      }

    } catch (err) {
      console.error('getInfo文件下的_handleGetInfoRequest代码出现问题: 向后端getinfo接口发送请求接收异常', { errMsg: err.message, stack: err.stack });
      uni.showToast({ title: '网络异常，无法获取身份信息', icon: 'none', duration: 2000 });
    }
  }
};