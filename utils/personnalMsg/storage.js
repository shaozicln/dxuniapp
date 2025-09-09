// 本地存储工具：统一处理用户信息的存储操作
export const storageUtil = {
  saveUserInfo(userInfo) {
    try {
      const oldInfo = this.getUserInfo() || {};
      const newInfo = { ...oldInfo, ...userInfo }; // 合并新旧数据
      uni.setStorageSync('userInfo', newInfo);
      console.log('storageUtil: 用户信息保存成功', newInfo);
      return true;
    } catch (err) {
      console.error('storageUtil: 保存用户信息失败', err);
      uni.showToast({ title: '保存失败，请重试', icon: 'none' });
      return false;
    }
  },
//从本地存储读取用户信息
  getUserInfo() {
    try {
      return uni.getStorageSync('userInfo') || null;
    } catch (err) {
      console.error('storageUtil: 读取用户信息失败', err);
      return null;
    }
  }
};