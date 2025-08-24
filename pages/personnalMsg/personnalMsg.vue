<template>
  <view class="profile-page">
    <!-- 顶部背景区域 -->
    <view class="profile-header">
      <!-- 左上角返回按钮 -->
      <view class="back-button" @tap="navigateBack">
        <text class="back-icon">←</text>
      </view>

      <!-- 头像区域 -->
      <view class="avatar-container">
        <image 
          class="avatar" 
          :src="userInfo.avatar" 
          mode="widthFix"
        ></image>
      </view>
    </view>

    <!-- 信息列表区域 -->
    <view class="info-list">
      <view 
        class="info-item" 
        v-for="(item, index) in infoItems" 
        :key="index"
      >
        <view class="info-label">{{ item.label }}</view>
        <view class="info-value">{{ item.value }}</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';

const userInfo = reactive({
  avatar: '/static/default-avatar.png',
  name: '张明',
  identity: '学生',
  gender: '男',
  college: '计算机学院',
  className: '2023级软件班',
  major: '软件工程',
  studentId: '2023012345',
  contact: '138****6789'
});

const infoItems = ref([]);
const navigateBack = () => {
  const pages = getCurrentPages(); 
  if (pages.length > 1) {
    uni.navigateBack({ delta: 1 });
  } else {
    uni.redirectTo({ url: '/pages/my/my' });
  }
};

onMounted(() => {
  setTimeout(() => {
    infoItems.value = [
      { label: '姓名', value: userInfo.name },
      { label: '身份', value: userInfo.identity },
      { label: '性别', value: userInfo.gender },
      { label: '学院', value: userInfo.college },
      { label: '班级', value: userInfo.className },
      { label: '专业', value: userInfo.major },
      { label: '学号', value: userInfo.studentId },
      { label: '联系方式', value: userInfo.contact }
    ];
    console.log('个人信息页面初始化完成');
  }, 0);
});
</script>

<style scoped>
.profile-page {
  background-color: #f5f5f5;
  min-height: 100vh;
  font-size: 16px;
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
}

.info-item {
  display: flex;
  padding: 30rpx 0;
  border-bottom: 1px solid #eaeaea;
  background-color: #fff;
  transition: background-color 0.2s;
  justify-content: flex-start;
}

.info-label {
  width: 200rpx;
  color: #666;
  padding-left: 20rpx;
  font-weight: normal;
  text-align: left;
}

.info-value {
  flex: 1;
  color: #333;
  padding-right: 20rpx;
  text-align: left;
  font-weight: 500;
}
</style>