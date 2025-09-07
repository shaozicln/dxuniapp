<template>
  <view class="profile-page">
    <view class="profile-header">
      <view class="back-button" @tap="navigateBack">
        <text class="back-icon">←</text>
      </view>
      <view class="avatar-container">
		  <image 
          class="avatar" 
          :src="userInfo.avatar" 
          mode="widthFix"
        ></image>
      </view>
    </view>

    <view class="info-list">
		<view 
        :class="[
          'info-item',
          { 'editable-item': item.canEdit }
        ]"
        v-for="(item, index) in infoItems" 
        :key="index"
        @tap="handleInfoEdit(item)"
      >
        <view class="info-label">{{ item.label }}</view>
        <view class="info-value-wrap">
          <text class="info-value">{{ item.value }}</text>
          <text class="edit-arrow" v-if="item.canEdit">→</text>
        </view>
      </view>
    </view>

    <view class="logout-container">
      <button 
        class="logout-button" 
        @click="handleLogout"
      >
        退出登录
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';

const userInfo = reactive({
  avatar: '/static/default-avatar.png', // 本地默认头像路径（确保文件存在）
  name: '未设置',
  identity: '未登录',
  gender: '未设置',
  college: '未设置',
  className: '未设置',
  major: '未设置',
  studentId: '未设置',
  teacherId: '',
  contact: '未设置'
});

const infoItems = ref([]); // 列表数据（响应式）
const editableFields = [
  { label: '性别', field: 'gender', type: 'select', options: ['男', '女', '保密'] },
  { label: '学院', field: 'college', type: 'input', placeholder: '请输入学院名称' },
  { label: '班级', field: 'className', type: 'input', placeholder: '请输入班级（如计科2301）' },
  { label: '专业', field: 'major', type: 'input', placeholder: '请输入专业名称' },
  { label: '联系方式', field: 'contact', type: 'input', placeholder: '请输入手机号' }
];

const navigateBack = () => {
  uni.navigateBack({ delta: 1 }).catch(() => {
    uni.redirectTo({ url: '/pages/my/my' });
  });
};

const handleInfoEdit = (item) => {
  const fieldConfig = editableFields.find(config => config.label === item.label);
  if (!fieldConfig) return;

  if (fieldConfig.type === 'select') {
    uni.showActionSheet({
      itemList: fieldConfig.options,
      success: (res) => {
        const selectedValue = fieldConfig.options[res.tapIndex];
        userInfo[fieldConfig.field] = selectedValue; // 更新响应式数据
        updateInfoListAndStorage(); // 同步列表和存储
      },
      fail: (err) => console.error('选择失败:', err)
    });
  } 
  // 输入型弹窗（如学院、班级）
  else if (fieldConfig.type === 'input') {
    uni.showModal({
      title: `修改${item.label}`,
      editable: true,
      placeholderText: fieldConfig.placeholder,
      value: item.value !== '未设置' ? item.value : '', 
      success: (res) => {
        if (res.confirm && res.content.trim()) { 
          const inputValue = res.content.trim();
          userInfo[fieldConfig.field] = inputValue; // 更新响应式数据
          updateInfoListAndStorage(); // 同步列表和存储
        }
      },
      fail: (err) => console.error('输入弹窗失败:', err)
    });
  }
};

//  同步列表数据 + 保存到本地存储
const updateInfoListAndStorage = () => {

  infoItems.value = [
    { label: '姓名', value: userInfo.name, canEdit: false },
    { label: '身份', value: userInfo.identity, canEdit: false },
    { label: '性别', value: userInfo.gender, canEdit: true },
    { label: '学院', value: userInfo.college, canEdit: true },
    { label: '班级', value: userInfo.className, canEdit: true },
    { label: '专业', value: userInfo.major, canEdit: true },
    { 
      label: userInfo.identity === '老师' ? '教工号' : '学号', 
      value: userInfo.teacherId || userInfo.studentId, 
      canEdit: false 
    },
    { label: '联系方式', value: userInfo.contact, canEdit: true }
  ];

  try {
    const oldUserInfo = uni.getStorageSync('userInfo') || {};
    const newUserInfo = { ...oldUserInfo, ...userInfo }; 
    uni.setStorageSync('userInfo', newUserInfo);
    console.log('用户信息已保存到本地:', newUserInfo);
  } catch (err) {
    console.error('保存失败:', err);
    uni.showToast({ title: '保存失败，请重试', icon: 'none' });
  }
};

const handleLogout = () => {
  uni.showModal({
    title: '确认退出',
    content: '退出后需重新登录，是否继续？',
    confirmText: '退出',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) {
        // 清除用户登录状态
        try {
          uni.removeStorageSync('userInfo');
        } catch (err) {
          console.error('清除登录状态失败:', err);
        }
        uni.showToast({ title: '已退出登录', icon: 'none', duration: 1500 });
        // 延迟跳转，确保提示可见
        setTimeout(() => {
          uni.redirectTo({ url: '/pages/login/login' });
        }, 1500);
      }
    }
  });
};

onMounted(() => {
  try {
    const storedUserInfo = uni.getStorageSync('userInfo');
    if (storedUserInfo) {
      Object.keys(userInfo).forEach(key => {
        if (storedUserInfo[key] !== undefined && storedUserInfo[key] !== '') {
          userInfo[key] = storedUserInfo[key];
        }
      });
      userInfo.identity = userInfo.teacherId?.startsWith('Z') ? '老师' : '学生';
    }
  } catch (err) {
    console.error('读取用户信息失败:', err);
    uni.showToast({ title: '信息加载失败', icon: 'none' });
  }
  // 初始化列表数据
  updateInfoListAndStorage();
});

</script>

<style scoped>
/* 样式保持不变，无需修改 */
.profile-page {
  background-color: #f5f5f5;
  min-height: 100vh;
  font-size: 16px;
  padding-bottom: 100rpx; 
}

.profile-header {
  height: 200rpx;
  background: linear-gradient(to bottom, #87CEEB, #F5F5F5); 
  position: relative;
  transition: height 0.3s ease;
  padding-top: 40rpx; 
}

.back-button {
  position: absolute;
  left: 20rpx; 
  top: 40rpx; 
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2); 
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10; 
  transition: background-color 0.2s;
}

.back-button:active {
  background-color: rgba(255, 255, 255, 0.3);
}

.back-icon {
  color: #fff; 
  font-size: 36rpx;
  font-weight: bold;
}

.avatar-container {
  position: absolute;
  left: 50%;
  bottom: -60rpx;
  transform: translateX(-50%);
  width: 120rpx;
  height: 120rpx;
  border: 5rpx solid #fff;
  border-radius: 50%;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  transition: transform 0.3s ease;
}

.avatar:active {
  transform: scale(0.95);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.info-list {
  margin-top: 80rpx;
  max-width: 700rpx;
  margin-left: auto;
  margin-right: auto;
  padding: 0 30rpx;
  animation: fadeIn 0.5s ease;
  background-color: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.info-item {
  display: flex;
  padding: 30rpx 0;
  border-bottom: 1px solid #eaeaea;
  background-color: #fff;
  transition: background-color 0.2s;
  justify-content: flex-start;
  align-items: center;
}

.editable-item {
  cursor: pointer;
}
.editable-item:active {
  background-color: #fafafa;
}

.info-value-wrap {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 20rpx;
}

.info-label {
  width: 200rpx;
  color: #666;
  padding-left: 20rpx;
  font-weight: normal;
  text-align: left;
}

.info-value {
  color: #333;
  font-weight: 500;
  text-align: left;
}

.edit-arrow {
  color: #ccc;
  font-size: 24rpx;
  margin-left: 10rpx;
}

.info-item:last-child {
  border-bottom: none;
}

.logout-container {
  display: flex;
  justify-content: center;
  margin-top: 60rpx;
  padding: 0 30rpx;
}

.logout-button {
  width: 100%;
  max-width: 700rpx;
  height: 100rpx;
  line-height: 100rpx;
  background-color: #ff4d4f;
  color: #fff;
  border-radius: 50rpx;
  font-size: 34rpx;
  border: none;
  box-shadow: 0 4rpx 12rpx rgba(255, 77, 79, 0.3);
  transition: all 0.2s;
}

.logout-button:active {
  background-color: #d9363e;
  transform: scale(0.98);
}

.logout-button::after {
  border: none;
}
</style>
