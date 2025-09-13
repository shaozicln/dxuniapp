// 错误处理工具
export const errorHandler = {
  handleUserInitError(userInfo, err, navigateToLogin) {
    console.error('用户信息初始化异常：', err.message || err);
    userInfo.identity = '未登录';
    //在页面上显示一条短期的提示消息
    uni.showToast({ 
      title: '身份加载失败，请重新登录', 
      icon: 'none', 
      duration: 3000,
	  //设置是否显示 “透明遮罩层”（true 显示，false 不显示）
      mask: true
    });
    setTimeout(navigateToLogin, 3000);
  },
//处理头像加载错误
  handleAvatarError(e) {
    e.currentTarget.src = '/static/default-avatar.png';
  }
};
