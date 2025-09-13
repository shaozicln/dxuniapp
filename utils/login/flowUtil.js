import { post } from '../request/request.js';
// 登录流程工具：封装自动登录、手动登录、微信code获取逻辑
export const loginFlowUtil = {
  // 获取微信登录code
  async getWxCode() {
    return new Promise((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: (res) => {
          if (res.code) resolve(res.code);
          else reject(new Error(`获取微信code失败: ${res.errMsg}`));
        },
        fail: (err) => reject(new Error(`微信登录接口失败: ${err.errMsg}`))
      });
    });
  },

  // 自动登录流程（调用后端/loginByCode)
  async autoLogin(wxCode) {
    console.log('调用后端/loginByCode接口，请求自动登录');
    const autoLoginRes = await post('https://jxpj.neau.edu.cn/api/v1/loginByCode', {
      weixincode: wxCode
    });
    // 从本地获取userID
    const userID = uni.getStorageSync('userID') || '';
    return { autoLoginRes, userID };
  },

  // 手动登录流程（调用后端/login）
  async manualLogin(wxCode, userID) {
    console.log('调用后端/login接口，提交手动登录信息');
    return await post('https://jxpj.neau.edu.cn/api/v1/login', {
      weixincode: wxCode,
      username: userID,
      password: userID 
    });
  },

  validateInput(userID, name) {
    let trimmedUserID = userID.trim();
    const trimmedName = name.trim();

    // 非空校验
    if (!trimmedUserID || !trimmedName) {
      throw new Error('请输入完整的教工号/学工号和姓名');
    }

    // 校验学工号格式（A/a + 8位数字）
    if (/^[Aa]/.test(trimmedUserID)) {
		//.test(trimmedUserID): 测试trimmedUserID是否符合该正则模式
      if (!/^[Aa]\d{8}$/.test(trimmedUserID)) {
        throw new Error('学工号格式错误（应为A/a+8位数字，如A19230111）');
      }
      // 统一格式化为大写A开头
      trimmedUserID = 'A' + trimmedUserID.slice(1).toUpperCase();
    }
    // 校验教工号格式（Z/z + 5位数字）
    else if (/^[Zz]/.test(trimmedUserID)) {
      if (!/^[Zz]\d{5}$/.test(trimmedUserID)) {
        throw new Error('教工号格式错误（应为Z/z+5位数字，如Z10005）');
      }
      // 统一格式化为大写Z开头
      trimmedUserID = 'Z' + trimmedUserID.slice(1).toUpperCase();
    }
    else {
      throw new Error('学工号应为A/a+8位数字，教工号应为Z/z+5位数字');
    }

    return { trimmedUserID, trimmedName };
  }
};