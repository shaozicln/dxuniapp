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

// 用户信息响应式数据
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

// 信息项数组
const infoItems = ref([]);
const navigateBack = () => {
  // 获取当前页面栈
  const pages = getCurrentPages(); 
  if (pages.length > 1) {
    // 页面栈长度大于 1，说明有上一页，正常返回
    uni.navigateBack({
      delta: 1 
    });
  } else {
    // 页面栈长度为 1，说明是第一个页面，这里跳转到 my 页面示例（根据实际需求调整）
    uni.redirectTo({
      url: '/pages/my/my' 
    });
  }
};

// 使用异步初始化
onMounted(() => {
  // 将初始化操作放入 setTimeout 中确保异步执行
  setTimeout(() => {
    // 初始化信息项
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

/* 顶部背景区域统一样式 */
.profile-header {
  height: 200rpx;
  /* 修改为你想要的垂直渐变背景 */
  background: linear-gradient(to bottom, #87CEEB, #F5F5F5); 
  position: relative;
  transition: height 0.3s ease;
  padding-top: 40rpx; /* 预留状态栏高度，避免按钮被遮挡 */
}

/* 新增：返回按钮样式 */
.back-button {
  position: absolute;
  left: 20rpx; /* 左侧边距 */
  top: 40rpx; /* 与 padding-top 一致，垂直居中 */
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2); /* 半透明白色背景 */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10; /* 确保在头像上方显示 */
  transition: background-color 0.2s;
}

/* 按钮点击反馈 */
.back-button:active {
  background-color: rgba(255, 255, 255, 0.3);
}

/* 返回图标样式 */
.back-icon {
  color: #fff; /* 白色图标，与背景对比 */
  font-size: 36rpx;
  font-weight: bold;
}

/* 头像容器 */
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

/* 头像样式 */
.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  transition: transform 0.3s ease;
}

.avatar:active {
  transform: scale(0.95);
}

/* 信息列表 */
.info-list {
  margin-top: 80rpx;
  padding: 0 30rpx;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}

/* 信息项 */
.info-item {
  display: flex;
  padding: 30rpx 0;
  border-bottom: 1px solid #eaeaea;
  background-color: #fff;
  transition: background-color 0.2s;
}

.info-item:active {
  background-color: #f9f9f9;
}

/* 标签样式 */
.info-label {
  width: 200rpx;
  color: #666;
  padding-left: 20rpx;
  font-weight: normal;
}

/* 值样式 */
.info-value {
  flex: 1;
  color: #333;
  padding-right: 20rpx;
  text-align: right;
  font-weight: 500;
}
</style>