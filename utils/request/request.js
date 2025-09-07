import {
	getCurrentInstance
} from 'vue';

export const getBaseURL = () => {
  const instance = getCurrentInstance();
  let baseUrl = instance?.appContext?.config?.globalProperties?.$URL ;
  return baseUrl.replace(/\/$/, '');
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