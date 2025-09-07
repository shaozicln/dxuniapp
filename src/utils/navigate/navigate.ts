interface NavigateOptions {
  loadingText?: string;
  success?: (res: any) => void;
  fail?: (err: UniApp.GeneralCallbackResult) => void;
  onError?: (err: UniApp.GeneralCallbackResult) => void;
}

export function navigateToWithLoading(
  url: string, 
  options: NavigateOptions = {}
): Promise<any> { 
  if (!url || !url.startsWith('/')) {
    const err = new Error(`跳转路径不合法：${url}，需以 / 开头（如 /pages/index/index）`) as Error & { errMsg?: string };
    err.errMsg = `navigateToWithLoading:fail ${err.message}`;

    options.onError?.(err as UniApp.GeneralCallbackResult);
    uni.showToast({ title: '路径错误', icon: 'none' });
    return Promise.reject(err);
  }
  
  uni.showLoading({
    title: options.loadingText || '加载中...',
    mask: true,
    success: () => {},
    fail: (loadErr) => {
      options.onError?.(loadErr);
      return Promise.reject(loadErr);
    }
  });
  
  return new Promise((resolve, reject) => {
    uni.navigateTo({
      url,
      success: (res) => {
        uni.hideLoading();
        options.success?.(res);
        resolve(res);
      },
      fail: (err) => {
        uni.hideLoading();
        if (options.onError) {
          options.onError(err);
        } else {
          const errorMap: Record<string, string> = {
            'page not found': '页面不存在',
            'timeout': '加载超时',
            'navigateTo:fail can not navigate to tabbar page': '不能跳转到 tabbar 页面（需用 switchTab）',
            'navigateTo:fail page "xxx" is not found': '目标页面未在 pages.json 注册'
          };
          const matchKey = Object.keys(errorMap).find(key => 
            err.errMsg.toLowerCase().includes(key.toLowerCase())
          ) || 'default';
          uni.showToast({
            title: errorMap[matchKey] || '跳转失败',
            icon: 'none',
            duration: 2000
          });
          console.error('页面跳转失败:', err);
        }
        options.fail?.(err);
        reject(err);
      }
    });
  });
}
