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
        />
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
      <text class="logout-tip">点击退出登录后，个人信息将全部清空</text>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { userInfoUtil } from '/utils/personnalMsg/userInfoUtil';
import { logoutUtil } from '/utils/personnalMsg/logoutUtil';
import { storageUtil } from '/utils/personnalMsg/storage.js';
const userInfo = reactive({
  avatar: '/static/default-avatar.png',
  name: '未设置',
  identity: '未登录',
  gender: '未设置',
  college: '未设置',
  className: '未设置',
  major: '未设置',
  studentID: '未设置',
  teacherID: '',
  department: '未设置' 
});
const infoItems = ref([]); 
const navigateBack = () => {
  uni.navigateBack({ delta: 1 }).catch(() => {
    uni.switchTab({ url: '/pages/my/my' });
  });
};
const handleInfoEdit = (item) => {
  if (!item.canEdit) return;
  const editableFields = userInfoUtil.getEditableFields(userInfo.identity);
  const fieldConfig = editableFields.find(cfg => cfg.label === item.label);
  if (!fieldConfig) return;

  if (fieldConfig.type === 'select') {
    uni.showActionSheet({
      itemList: fieldConfig.options,
      success: (res) => {
        userInfo[fieldConfig.field] = fieldConfig.options[res.tapIndex];
        updateInfoAndStorage();
      },
      fail: (err) => console.error('编辑失败:', err)
    });
  } else if (fieldConfig.type === 'input') {
    uni.showModal({
      title: `修改${item.label}`,
      editable: true,
      placeholderText: fieldConfig.placeholder,
      value: item.value !== '未设置' ? item.value : '',
      success: (res) => {
        if (res.confirm && res.content.trim()) {
          userInfo[fieldConfig.field] = res.content.trim();
          updateInfoAndStorage();
        }
      },
      fail: (err) => console.error('编辑失败:', err)
    });
  }
};
// 同步信息列表+本地存储
const updateInfoAndStorage = () => {
  infoItems.value = userInfoUtil.generateInfoList(userInfo);
  storageUtil.saveUserInfo(userInfo);
};
// 退出登录
const handleLogout = () => {
  logoutUtil.doLogout(); 
};
// 页面挂载：初始化用户信息
onMounted(() => {
  userInfoUtil.initFromStorage(userInfo);
  updateInfoAndStorage();
  console.log('个人页初始化后身份信息:', userInfo.identity);
});
</script>

<style scoped>
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
  flex-direction: column; 
  justify-content: center;
  margin-top: 60rpx;
  padding: 0 30rpx;
  gap: 15rpx;
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
.logout-tip {
  font-size: 24rpx; 
  color: #999;
  text-align: center; 
  padding: 0 20rpx; 
}
</style>