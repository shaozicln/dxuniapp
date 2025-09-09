import { post } from '../request/request.js';
// 退出登录工具：弹窗确认、接口请求、状态清除
export const logoutUtil = {
  async doLogout(redirectCb) {
    uni.showModal({
      title: '确认退出',
      content: '退出后需重新登录，是否继续？',
      confirmText: '退出',
      cancelText: '取消',
      success: async (res) => {
        if (res.confirm) {
          await this._handleLogoutRequest(redirectCb);
        }
      }
    });
  },

  async _handleLogoutRequest(redirectCb) {
    try {
      // 2. 获取本地Token
      const token = uni.getStorageSync('autoToken') || uni.getStorageSync('token');
      if (!token) {
        console.warn('logoutUtil: 本地无有效Token，直接清除状态');
        this._clearLoginState(redirectCb);
        return;
      }

      const res = await post(
        'https://jxpj.neau.edu.cn/api/v1/logout',
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      // 处理接口响应
      if (res?.code === 200) {
        console.log('logoutUtil: 后端退出成功');
        uni.showToast({ title: '已退出登录', icon: 'none', duration: 1500 });
        this._clearLoginState(redirectCb);
      } else {
        console.error('logoutUtil: 后端退出失败', res);
        uni.showToast({ title: '退出失败，请重试', icon: 'none' });
      }
    } catch (err) {
      console.error('logoutUtil: 退出请求异常', err);
      uni.showToast({ title: '网络异常，已强制退出', icon: 'none' });
      this._clearLoginState(redirectCb);
    }
  },

  _clearLoginState(redirectCb) {
    try {
      uni.removeStorageSync('autoToken');
      uni.removeStorageSync('token');
      uni.removeStorageSync('userInfo');
      uni.removeStorageSync('isLogin');
	    uni.removeStorageSync('userID');
    } catch (err) {
      console.error('logoutUtil: 清除状态失败', err);
    }
    if (typeof redirectCb === 'function') {
      redirectCb();
    } else {
      setTimeout(() => uni.redirectTo({ url: '/pages/login/login' }), 3000);
    }
  }
};