import {getCurrentInstance} from 'vue';

export const getBaseURL = () => {
  let baseUrl = 'https://jxpj.neau.edu.cn/api/v1'; // 初始值设为空字符串，避免 undefined
  const instance = getCurrentInstance();

  /* // 1. 尝试从 Vue 3 实例获取全局 URL
  if (instance && instance.appContext?.config?.globalProperties?.$URL) {
    baseUrl = instance.appContext.config.globalProperties.$URL;
    console.log('从 Vue 3 实例获取到全局 URL:', baseUrl); 
  } 
  // 2. 兼容 Vue 2 环境
  else if (window.Vue && window.Vue.prototype.$URL) {
    baseUrl = window.Vue.prototype.$URL;
    console.log('从 Vue 2 原型获取到全局 URL:', baseUrl); 
  } 
  // 3. 兜底默认值，防止 baseUrl 为空
  else {
    baseUrl = 'http://localhost:8080'; // 默认地址，可根据实际修改
    console.warn('未获取到全局 URL，使用默认值:', baseUrl); 
  }

  // 此时 baseUrl 一定有值，再调用 replace 方法 */
  const formattedUrl = baseUrl.replace(/\/$/, ''); 
  console.log('格式化后的基础 URL:', formattedUrl); // 输出最终使用的 URL
  return formattedUrl;
};



export const request = (options) => {
	// 1. 获取基础URL并拼接完整路径
	const baseURL = getBaseURL();
	let fullUrl = options.url;

	if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
		const path = fullUrl.replace(/^\/+/, ''); // 移除路径开头的斜杠
		fullUrl = `${baseURL}/${path}`;
	}

	// 2. 自动获取本地存储的Token
	const token = uni.getStorageSync('Admin-Token') || '';

	// 3. 构建请求头（自动携带Token）
	const defaultHeaders = {
		'Accept': '*/*',
		'Connection': 'keep-alive',
		...(token && {
			'Authorization': token
		}), // 有Token时才添加
		...options.headers // 允许用户传入自定义头（可覆盖默认值）
	};

	console.log('请求URL:', fullUrl);
	console.log('请求头:', defaultHeaders);

	return new Promise((resolve, reject) => {
		uni.request({
			...options,
			url: fullUrl,
			header: defaultHeaders, // 注意uni-app中是header而非headers
			success: (res) => {
				// 统一处理401 Token失效
				if (res.statusCode === 401) {
					uni.removeStorageSync('Admin-Token');
					uni.showToast({
						title: '登录已过期，请重新登录',
						icon: 'none'
					});
					reject(new Error('Token失效'));
					return;
				}
				resolve(res.data);
			},
			fail: (err) => {
				reject(new Error(`请求失败: ${err.errMsg}`));
			}
		});
	});
};

// 快捷请求方法
export const get = (url, data = {}, options = {}) => {
	return request({
		...options,
		url,
		data,
		method: 'GET'
	});
};

export const post = (url, data = {}, options = {}) => {
	return request({
		...options,
		url,
		data,
		method: 'POST'
	});
};

export const put = (url, data = {}, options = {}) => {
	return request({
		...options,
		url,
		data,
		method: 'PUT'
	});
};

export const del = (url, data = {}, options = {}) => {
	return request({
		...options,
		url,
		data,
		method: 'DELETE'
	});
};