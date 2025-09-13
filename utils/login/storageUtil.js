// 登录存储工具：封装本地存储读写、用户信息构造逻辑
export const loginStorageUtil = {
  buildUserInfo(userID, name, token) {
    return {
      userID,
      name: name || '未设置',
      teacherID: userID.startsWith('Z') ? userID : '',
      studentID: userID.startsWith('Z') ? '' : userID,
      loginTime: new Date().toLocaleString(),
      token
    };
  },
//存储自动登录数据到本地
//userInfo = null表示第二个参数是可选的，如果不提供则默认为null值
  saveAutoLoginData(token, userInfo = null) {
    uni.setStorageSync('autoToken', token);
    if (userInfo) {
      uni.setStorageSync('userInfo', userInfo);
    }
  },
//存储手动登录数据到本地
  saveManualLoginData(token, userInfo) {
    uni.setStorageSync('token', token);
    uni.setStorageSync('userInfo', userInfo);
    uni.setStorageSync('isLogin', true);
  },
//获取本地存储的登录数据
  getLocalLoginData() {
    return {
      localAutoToken: uni.getStorageSync('autoToken'),
      localManualToken: uni.getStorageSync('token'),
      localUser: uni.getStorageSync('userInfo')
    };
  },
  completeUserIdentity(localUser) {
    if (localUser?.userID && !localUser.teacherID && !localUser.studentID) {
      console.log('补全本地用户身份字段（teacherID/studentID）');
      return {
        ...localUser,
        teacherID: localUser.userID.startsWith('Z') ? localUser.userID : '',
        studentID: localUser.userID.startsWith('Z') ? '' : localUser.userID
      };
    }
    return localUser;
  },

};