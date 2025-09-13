// 导航服务工具
import { navigateToWithLoading } from '../navigate/navigate';

export const navigationService = {
//跳转到个人信息编辑页（excludeFields：需要排除的字段名数组（如 ['password', 'token']））
  async goToProfileEdit(userRole, userInfo, excludeFields = []) {
    if (userRole === '未登录') {
      this.showToast('请先登录再编辑信息');
      return;
    }

    try {
      const userInfoStr = this.serializeUserInfo(userInfo, excludeFields);

      const navigateOptions = {
        loadingText: '加载编辑页...',
        query: { userInfo: userInfoStr || '{}' },
        onError: (err) => {
          console.warn('跳转编辑页异常：', err);
          this.showToast('跳转失败，请稍后重试');
        },
        success: () => {
          console.log('跳转编辑页成功');
        }
      };

      await navigateToWithLoading('/pages/personalMsg/personalMsg', navigateOptions);
    } catch (err) {
      console.error('跳转编辑页失败：', err.message || err);
      this.showToast('系统异常，无法跳转');
    }
  },

//跳转到登录页
  async goToLogin(message = '身份加载失败，请重新登录') {
    this.showToast(message, { duration: 3000 });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    uni.showModal({
      title: '身份验证失败',
      content: '是否前往登录页？',
      showCancel: true,
      cancelText: '取消',
      confirmText: '去登录',
      mask: true,
      success: (res) => {
        if (res.confirm) {
          uni.hideModal();
          navigateToWithLoading('/pages/login/login');
        }
      }
    });
  },

//序列化用户信息
//将用户信息对象（userInfo）转换为 JSON 字符串，同时排除指定的敏感 / 无关字段（excludeFields）
  serializeUserInfo(userInfo, excludeFields) {
    try {
      return JSON.stringify(userInfo, (key, value) => {
        return excludeFields.includes(key) ? undefined : value;
      });
    } catch (stringifyErr) {
      throw new Error(`用户信息序列化失败：${stringifyErr.message}`);
    }
  },

//显示提示消息
  showToast(title, options = {}) {
    uni.showToast({
      title,
      icon: options.icon || 'none',
      duration: options.duration || 2000,
      mask: options.mask || true,
      ...options
    });
  }
};
