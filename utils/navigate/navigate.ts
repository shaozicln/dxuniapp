import { UniApp } from 'vue';

interface NavigateOptions {
  loadingText?: string;
  success?: () => void;
  fail?: (err: UniApp.NavigateToOptionsFailCallbackResult) => void;
  onError?: (err: UniApp.NavigateToOptionsFailCallbackResult) => void;
}

export function navigateToWithLoading(url: string, options: NavigateOptions = {}) {
  uni.showLoading({ title: options.loadingText || '加载中...' });
  
  return new Promise<UniApp.NavigateToOptionsSuccessCallbackResult>((resolve, reject) => {
    uni.navigateTo({
      url,
      success: (res) => {
        uni.hideLoading();
        options.success?.();
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
          };
          const matchKey = Object.keys(errorMap).find(key => err.errMsg.includes(key)) || 'default';
          uni.showToast({ 
            title: errorMap[matchKey] || '跳转失败', 
            icon: 'none' 
          });
          console.error('跳转错误:', err);
        }
        
        options.fail?.(err);
        reject(err);
      }
    });
  });
}