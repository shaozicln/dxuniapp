// 1. 只从 'uni-app' 导入需要的具体类型（无需导入整个 UniApp）
import type {
  NavigateToOptions,
  NavigateToOptionsFailCallbackResult,
  NavigateToOptionsSuccessCallbackResult
} from 'uni-app';

// 2. 统一：只定义一个“导出接口”，避免局部/导出冲突
// 扩展原生 NavigateToOptions，添加 loadingText（加载提示）和 onError（自定义错误回调）
export interface NavigateOptions extends NavigateToOptions {
  loadingText?: string; // 可选：加载提示文本（默认“加载中...”）
  onError?: (err: NavigateToOptionsFailCallbackResult) => void; // 可选：自定义错误回调
}

// 3. 唯一函数实现：保留错误处理更完善的版本（删除重复的 async 版本）
// 函数返回值类型：明确为 Promise<NavigateToOptionsSuccessCallbackResult>（符合 uni.navigateTo 成功回调类型）
export function navigateToWithLoading(
  url: string,
  options: NavigateOptions = {} // 默认值避免无参数时的类型错误
): Promise<NavigateToOptionsSuccessCallbackResult> {
  // 显示加载提示（mask: true 防止用户误操作）
  uni.showLoading({
    title: options.loadingText || '加载中...',
    mask: true
  });

  // 返回 Promise，便于外部用 async/await
  return new Promise((resolve, reject) => {
    uni.navigateTo({
      url,
      // 解构原生参数（如 query、events 等，继承自 NavigateToOptions）
      ...options,
      // 成功回调：隐藏加载+触发外部 success+resolve
      success: (res) => {
        uni.hideLoading();
        options.success?.(res); // 触发外部传入的 success 回调
        resolve(res); // Promise 成功决议
      },
      // 失败回调：隐藏加载+触发外部 onError/fail+reject
      fail: (err) => {
        uni.hideLoading();

        // 优先触发自定义 onError 回调（外部可自定义错误提示）
        if (options.onError) {
          options.onError(err);
        } else {
          // 默认错误提示（覆盖常见场景）
          const errorMap: Record<string, string> = {
            'page not found': '页面不存在',
            'timeout': '加载超时',
            'can not redirectTo a tabbar page': '不能跳转到 tabbar 页面'
          };
          // 匹配错误信息，显示对应提示
          const matchKey = Object.keys(errorMap).find(key => err.errMsg.includes(key)) || 'default';
          uni.showToast({
            title: errorMap[matchKey] || '跳转失败，请重试',
            icon: 'none',
            duration: 2500
          });
          console.error('跳转错误详情:', err);
        }

        options.fail?.(err); // 触发外部传入的 fail 回调
        reject(err); // Promise 失败决议
      }
    });
  });
}