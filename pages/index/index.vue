<template>
  <view class="content">
    <image class="logo" src="/static/schoolLogo.png"></image>
    <view class="text-area">
      <text class="title">{{title}}</text>
    </view>
    
    <!-- 按钮区域 -->
    <view class="button-container">
      <view class="questionnaire-btn" @click="navigateToQuestionnaire">
        <image class="questionnaire-icon" src="/static/questionnaire.png"></image>
        <text class="questionnaire-text">问卷</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      title: '欢迎'
    }
  },
  onLoad() {

  },
  methods: {
    navigateToQuestionnaire() {
      uni.navigateTo({
        url: '/pages/questionnaire/questionnaire' 
      })
    }
  },
}
</script>

<style>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo {
  height: 200rpx;
  width: 380rpx;
  margin-top: 100rpx;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 50rpx;
}

.text-area {
  display: flex;
  justify-content: center;
}

.title {
  font-size: 36rpx;
  color: #8f8f94;
}

.button-container {
  margin-top: 80rpx;
}

.questionnaire-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 160rpx;
  height: 180rpx;
  border-radius: 20rpx;
  padding: 20rpx;
}

.questionnaire-icon {
  width: 80rpx;
  height: 80rpx;
  margin-bottom: 15rpx;
}

.questionnaire-text {
  font-size: 28rpx;
  color: #333;
}
</style>	