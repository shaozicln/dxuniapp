<template>
  <view class="questionnaire-detail-page">
    <!-- 顶部导航栏：添加 questionnaire 存在的判断 -->
    <view class="page-header" v-if="questionnaire">
      <view class="back-button" @click="handleBack">
        <text class="back-icon">←</text>
      </view>
      <view class="header-title">{{ questionnaire.title }}</view>
    </view>

    <!-- 加载中状态：数据未加载时显示 -->
    <view class="loading-state" v-else>
      <text>加载中...</text>
    </view>

    <!-- 问卷内容区域：同样添加判断 -->
    <view class="questionnaire-content" v-if="questionnaire">
      <view class="question-item" v-for="(question, qIndex) in questionnaire.questions" :key="qIndex">
        <view class="question-number">{{ qIndex + 1 }}.</view>
        <view class="question-text">{{ question.text }}</view>
        <view class="question-options">
          <view 
            class="option-item" 
            v-for="(option, oIndex) in question.options" 
            :key="oIndex"
            :class="{ selected: isOptionSelected(question.id, option.id) }"
            @click="selectOption(question.id, option.id)"
          >
            {{ option.text }}
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作区：添加判断 -->
    <view class="bottom-actions" v-if="questionnaire">
      <view 
        class="reset-btn" 
        v-if="questionnaire.status === 'completed'" 
        @click="resetQuestionnaire"
      >
        重新填写
      </view>
      <button 
        class="submit-btn" 
        v-if="questionnaire.status !== 'completed'" 
        @click="submitQuestionnaire"
      >
        提交问卷
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const questionnaire = ref(null);

onMounted(() => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const data = currentPage.options.data;
  if (data) {
    // 从路由参数中获取当前问卷数据
    const currentQuestionnaire = JSON.parse(decodeURIComponent(data));
    // 从本地存储中读取所有问卷，找到对应问卷（这里主要是为了初始化可能已存在的状态，比如之前提交过的）
    const allQuestionnaires = JSON.parse(uni.getStorageSync('questionnaires') || '[]');
    const storedQuestionnaire = allQuestionnaires.find(q => q.id === currentQuestionnaire.id);
    if (storedQuestionnaire) {
      questionnaire.value = storedQuestionnaire;
    } else {
      questionnaire.value = currentQuestionnaire;
    }
  } else {
    uni.navigateBack();
  }
});

const handleBack = () => {
  uni.navigateBack({
    delta: 1
  });
};

const selectOption = (questionId, optionId) => {
  if (!questionnaire.value) return;
  const question = questionnaire.value.questions.find(q => q.id === questionId);
  if (!question) return;
  if (question.type === 'single' || question.type === 'rating') {
    question.answer = optionId;
  } else if (question.type === 'multiple') {
    if (!question.answer) {
      question.answer = [optionId];
    } else if (question.answer.includes(optionId)) {
      question.answer = question.answer.filter(id => id !== optionId);
    } else {
      question.answer.push(optionId);
    }
  }
};

const isOptionSelected = (questionId, optionId) => {
  if (!questionnaire.value) return false;
  const question = questionnaire.value.questions.find(q => q.id === questionId);
  if (!question || !question.answer) return false;
  if (question.type === 'single' || question.type === 'rating') {
    return question.answer === optionId;
  } else if (question.type === 'multiple') {
    return question.answer.includes(optionId);
  }
  return false;
};

const submitQuestionnaire = () => {
  if (!questionnaire.value) return;
  const allAnswered = questionnaire.value.questions.every(question => {
    if (question.type === 'single' || question.type === 'rating') {
      return question.answer !== null;
    } else if (question.type === 'multiple') {
      return question.answer && question.answer.length > 0;
    }
    return true;
  });
  if (!allAnswered) {
    uni.showToast({
      title: '请回答所有问题',
      icon: 'none'
    });
    return;
  }
  uni.showLoading({
    title: '提交中...'
  });
  questionnaire.value.status = 'completed';
  const allQuestionnaires = JSON.parse(uni.getStorageSync('questionnaires') || '[]');
  const index = allQuestionnaires.findIndex(q => q.id === questionnaire.value.id);
  if (index !== -1) {
    allQuestionnaires[index] = JSON.parse(JSON.stringify(questionnaire.value));
  } else {
    allQuestionnaires.push(JSON.parse(JSON.stringify(questionnaire.value)));
  }
  uni.setStorageSync('questionnaires', JSON.stringify(allQuestionnaires));
  uni.hideLoading();
  uni.showToast({
    title: '提交成功',
    icon: 'success'
  });
  setTimeout(() => {
    uni.navigateBack({
      delta: 1
    });
  }, 800);
};

const resetQuestionnaire = () => {
  uni.showModal({
    title: '提示',
    content: '确定要重新填写这份问卷吗？当前答案将被清空。',
    success: (res) => {
      if (res.confirm && questionnaire.value) {
        questionnaire.value.questions.forEach(question => {
          question.answer = null;
        });
        questionnaire.value.status = 'pending';
        const allQuestionnaires = JSON.parse(uni.getStorageSync('questionnaires') || '[]');
        const index = allQuestionnaires.findIndex(q => q.id === questionnaire.value.id);
        if (index !== -1) {
          allQuestionnaires[index] = JSON.parse(JSON.stringify(questionnaire.value));
          uni.setStorageSync('questionnaires', JSON.stringify(allQuestionnaires));
        }
        uni.showToast({
          title: '已重置问卷，可重新填写',
          icon: 'none'
        });
      }
    }
  });
};
</script>

<style scoped>
.questionnaire-detail-page {
  background-color: #f5f5f5;
  min-height: 100vh;
  font-size: 16px;
  padding-bottom: 120rpx; /* 预留底部按钮区域 */
}

/* 页面头部样式优化 */
.page-header {
  height: 120rpx;
  background-color: #87CEEB;
  display: flex;
  align-items: center; 
  justify-content: center; 
  padding: 30rpx 30rpx 15rpx;
  position: relative;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.back-button {
  position: absolute;
  left: 20rpx; 
  top: 60rpx; 
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

/* 标题样式优化 */
.header-title {
  color: #777; 
  font-size: 36rpx;
  font-weight: 500;
  flex: 1;
  text-align: center;
  margin-left: -100rpx; /* 抵消返回按钮宽度，标题居中 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 问卷内容区域 */
.questionnaire-content {
  padding: 30rpx;
}

.question-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  padding-top: 35rpx;
}

.question-number {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 15rpx;
}

.question-text {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 20rpx;
  line-height: 1.6; /* 增加行高，提升阅读体验 */
}

.question-options {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.option-item {
  padding: 25rpx 30rpx;
  border: 1rpx solid #eaeaea;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #666;
  transition: all 0.2s;
}

.option-item.selected {
  border-color: #42b983;
  background-color: #e8f5e9;
  color: #42b983;
  position: relative;
}

.option-item.selected::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 6rpx;
  height: 100%;
  background-color: #42b983;
  border-radius: 3rpx 0 0 3rpx;
}

.option-item:active {
  background-color: #f5f5f5;
}

/* 底部操作区 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 20rpx 30rpx; 
  background-color: #fff;
  border-top: 1rpx solid #eaeaea;
  display: flex;
  justify-content: center; 
  align-items: center;
  z-index: 99;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

/* 提交按钮 */
.submit-btn {
  background-color: #87CEEB; 
  color: #fff;
  border: none;
  border-radius: 10rpx;
  width: auto;
  padding: 25rpx 40rpx; 
  text-align: center;
  font-size: 30rpx;
  box-shadow: 0 4rpx 10rpx rgba(135, 206, 235, 0.5); 
  transition: all 0.2s;
}

.submit-btn:active {
  background-color: #76b6d9; 
  box-shadow: 0 2rpx 5rpx rgba(135, 206, 235, 0.3);
  transform: scale(0.99);
}

/* 重填按钮 */
.reset-btn {
  width: auto; 
  padding: 25rpx 40rpx; 
  text-align: center;
  color: #87CEEB; 
  border: 1rpx solid #87CEEB;
  border-radius: 10rpx;
  font-size: 30rpx;
  background-color: #fff;
  transition: all 0.2s;
}

.reset-btn:active {
  background-color: #e6f2f7; 
  transform: scale(0.99);
}
</style>