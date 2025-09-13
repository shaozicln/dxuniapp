<template>
  <view class="my-container">
    <!-- 个人信息区域 -->
    <view class="profile-section" @tap="goToProfile" :hover-class="'profile-tap'"> 
      <view class="avatar-container">
        <image 
          class="avatar" 
          :src="userInfo.avatar" 
          mode="aspectFill"
          lazy-load 
          @error="handleAvatarError" 
        ></image>
      </view>
      <view class="user-info-wrapper">
        <view class="user-info">
		 <!-- {{ }} 是 Vue 中最基础的数据绑定方式，作用是 将双大括号内的表达式结果 “实时渲染” 到页面 -->	
          <text class="nickname">{{ userInfo.name || '未设置昵称' }}</text>
          <text class="desc">当前身份：{{ userRole || '未登录' }}</text>
        </view>
      </view>
    </view>

    <!-- 消息列表区域 -->
    <view class="message-section">
      <view class="section-title">
        <text>消息列表</text>
        <view class="unread-count" v-if="unreadMsgCount > 0">
          {{ unreadMsgCount }}
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-container" v-if="messageList.length === 0">
        <image class="empty-icon" src="/static/icons/empty-msg.png" mode="widthFix"></image>
        <text class="empty-tip">暂无消息，快去看看吧~</text>
      </view>

      <!-- 消息项 -->
      <view 
        class="message-item"
        :class="{ unread: item.unread }"
        @tap="handleItemTap(item, index)"
        @longpress="handleLongPress(item, index)"
        :hover-class="'msg-item-tap'"
        v-for="(item, index) in messageList" 
        :key="`msg-${item.id}`"
      >
        <view class="unread-dot" v-if="item.unread"></view>
        
        <view class="msg-content">
          <text class="message-title">{{ item.title || '无标题消息' }}</text>
          <text class="message-content">{{ item.content || '无内容' }}</text>
        </view>

        <!-- 操作按钮 -->
        <view class="action-buttons" v-if="item.unread">
          <button 
            class="btn cancel-unread" 
            size="mini" 
            @tap.stop="cancelUnread(index)"
          >
            取消标红
          </button>
          <button 
            class="btn delete-msg" 
            size="mini" 
            @tap.stop="deleteMessage(index)"
          >
            删除
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive, onMounted,  ref, computed } from 'vue';
import { onShow, onUnload } from '@dcloudio/uni-app';
import { userInfoManager } from '../../utils/my/userInfoManager';
import { messageHandler } from '../../utils/my/messageHandler';
import { navigationService } from '../../utils/my/navigationService';
import { errorHandler } from '../../utils/my/errorHandler.js';

//  响应式数据
const userInfo = reactive({
  avatar: '/static/default-avatar.png', 
  name: '未设置',
  identity: '未登录', 
  gender: '未设置',
  college: '未设置',
  className: '未设置',
  major: '未设置',
  studentID: '未设置',
  teacherID: '未设置',
  department: '未设置'
});

//  计算属性
const userRole = computed(() => {
  return userInfoManager.getValidIdentity(userInfo.identity);
});

const unreadMsgCount = computed(() => {
  return messageHandler.getUnreadCount(messageList.value);
});

// 消息列表
const messageList = ref([
  { id: 1, title: '系统通知', content: '新系统通知已送达', unread: true },
  { id: 2, title: '互动消息', content: '有学生提交了反馈', unread: true }, 
  { id: 3, title: '待办提醒', content: '请及时完善个人信息', unread: true }
]);

const refreshUserInfo = async () => {
  try {
    const initSuccess = await userInfoManager.initUserInfo(userInfo);
    if (!initSuccess) {
      console.warn('用户信息刷新失败，使用默认值');
      userInfo.identity = '未登录';
    }
  } catch (err) {
    errorHandler.handleUserInitError(
      userInfo, 
      err, 
      () => navigationService.goToLogin()
    );
  }
};

// 页面首次挂载：初始化一次
onMounted(async () => {
  await refreshUserInfo();
});

// 每次页面显示（如登录后返回），重新刷新信息
onShow(async () => {
  await refreshUserInfo();
});

// 监听全局“登录成功”事件（登录后主动触发刷新）
onMounted(() => {
  uni.$on('loginSuccess', async () => {
    console.log('收到登录成功事件，刷新用户信息');
    await refreshUserInfo();
  });
});

onUnload(() => {
  uni.$off('loginSuccess'); // 清除监听，防止重复触发
});

// 头像加载失败处理
const handleAvatarError = (e) => {
  errorHandler.handleAvatarError(e);
};

//  消息处理函数
const handleItemTap = (item, index) => {
  messageHandler.handleItemTap(messageList.value, item, index);
};

const cancelUnread = (index) => {
  messageHandler.cancelUnread(messageList.value, index);
};

const deleteMessage = async (index) => {
  await messageHandler.deleteMessage(messageList.value, index);
};

const handleLongPress = (item, index) => {
  messageHandler.handleLongPress(messageList.value, item, index);
};

// 跳转个人信息编辑页
const goToProfile = async () => {
  await navigationService.goToProfileEdit(
    userRole.value, 
    userInfo, 
    [] // 如需排除敏感字段，在此添加，例如['token']
  );
};
</script>

<style scoped>
.my-container {
  display: flex;
  flex-direction: column;
  background-color: #fafdff;
  min-height: 100vh;
  padding-top: 30rpx;
  padding-bottom: 15rpx;
  transition: background-color 0.3s ease;
}

/* 个人信息区域*/
.profile-section {
  width: 100%;
  min-height: 220rpx; 
  background: linear-gradient(135deg, #e6f7ff, #fafdff);
  display: flex;
  align-items: center;
  padding: 32rpx 40rpx; 
   padding-top: 100rpx;
  box-sizing: border-box;
  margin-bottom: 24rpx;
  border-bottom-left-radius: 36rpx; 
  border-bottom-right-radius: 36rpx;
  box-shadow: 0 8rpx 20rpx rgba(180, 225, 255, 0.15); 
  transition: all 0.3s ease; 
}

/* 头像容器 */
.avatar-container {
  width: 130rpx;
  height: 130rpx;
  border-radius: 50%;
  border: 4rpx solid #fff; 
  overflow: hidden;
  margin-right: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(120, 200, 255, 0.2);
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease; 
}
.avatar-container:hover .avatar {
  transform: scale(1.05); 
}

/* 用户信息容器 */
.user-info-wrapper {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 12rpx; 
}

/* 昵称样式 */
.nickname {
  font-size: 38rpx; 
  font-weight: 600;
  color: #2d3748; 
  line-height: 1.5;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05); 
}

/* 身份描述*/
.desc {
  font-size: 28rpx; 
  color: #718096; 
  line-height: 1.5;
}

/* 箭头图标： */
.arrow-icon {
  width: 32rpx;
  height: 32rpx;
  opacity: 0.7;
  transition: all 0.3s ease;
}
.profile-section:hover .arrow-icon {
  opacity: 1;
  transform: translateX(4rpx); 
}

/* 个人信息区域点击态 */
.profile-tap {
  opacity: 0.95;
  background: linear-gradient(135deg, #d9f0ff, #f5faff); 
  box-shadow: 0 6rpx 18rpx rgba(180, 225, 255, 0.1);
}

/* 消息列表区域 */
.message-section {
  flex: 1;
  padding: 0 24rpx;
  box-sizing: border-box;
}

/* 列表标题 */
.section-title {
  font-size: 34rpx; 
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 24rpx;
  padding-left: 18rpx; 
  border-left: 12rpx solid #87e8de; 
  display: flex;
  align-items: center;
  gap: 12rpx; 
}

/* 未读数量*/
.unread-count {
  width: 40rpx; 
  height: 40rpx;
  border-radius: 50%;
  background-color: #ff6b6b; 
  color: #fff;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 8rpx rgba(255, 107, 107, 0.3); 
  animation: pulse 2s infinite ease-in-out; 
}

/* 未读红点脉冲动画 */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 2rpx 8rpx rgba(255, 107, 107, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 3rpx 12rpx rgba(255, 107, 107, 0.4);
  }
}

/* 空状态 */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0; 
  gap: 28rpx;
}

.empty-icon {
  width: 180rpx; 
  height: 180rpx;
  opacity: 0.35; 
  transition: opacity 0.3s ease;
}
.empty-container:hover .empty-icon {
  opacity: 0.45; 
}

.empty-tip {
  font-size: 30rpx; 
  color: #a0aec0;
  line-height: 1.6;
  padding: 0 40rpx;
  text-align: center; 
}

/* 消息项*/
.message-item {
  padding: 28rpx 24rpx; 
  border: 1px solid #f0f4f8; 
  border-radius: 18rpx;
  margin-bottom: 22rpx;
  background-color: #fff;
  display: flex;
  align-items: flex-start;
  gap: 18rpx; 
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1); 
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.02); 
}

/* 未读消息卡片 */
.message-item.unread {
  background-color: #fff8f9;
  border-color: #ffe5e8;
  box-shadow: 0 4rpx 16rpx rgba(255, 107, 107, 0.03); 
}

/* 未读小点*/
.unread-dot {
  width: 18rpx; 
  height: 18rpx;
  border-radius: 50%;
  background-color: #ff6b6b;
  margin-top: 10rpx;
}

/* 消息内容容器*/
.msg-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx; 
}

/* 消息标题*/
.message-title {
  font-size: 30rpx; 
  font-weight: 600;
  color: #2d3748;
  line-height: 1.5;
}

/* 消息内容*/
.message-content {
  font-size: 26rpx; 
  color: #718096; 
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 消息项点击态*/
.msg-item-tap {
  background-color: #f9fafb !important;
  border-color: #e2e8f0;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.01);
  transform: translateY(2rpx); /
}

/* 操作按钮容器*/
.action-buttons {
  display: flex;
  gap: 18rpx; 
  margin-top: 12rpx; 
}

/* 按钮基础样式*/
.btn {
  padding: 12rpx 24rpx; 
  border-radius: 12rpx; 
  font-size: 26rpx; 
  border: none;
  min-width: 130rpx;
  transition: all 0.25s ease;
}

/* 取消标红按钮*/
.cancel-unread {
  background-color: #edf7ff; 
  color: #1890ff;
}
.cancel-unread:hover {
  background-color: #e6f4ff;
}
.cancel-unread:active {
  background-color: #d1eaff; 
}


.delete-msg {
  background-color: #fff5f5; 
  color: #ff6b6b;
}
.delete-msg:hover {
  background-color: #fff0f0; 
}
.delete-msg:active {
  background-color: #ffe6e6; 
}

/* 按钮点击态 */
.btn:active {
  opacity: 0.9;
  transform: scale(0.95); 
  transition: transform 0.1s ease;
}

/* 应用端适应*/
@media (max-width: 320px) {
  .nickname { font-size: 34rpx; }
  .desc { font-size: 26rpx; }
  .message-title { font-size: 28rpx; }
  .message-content { font-size: 24rpx; }
  .avatar-container { width: 120rpx; height: 120rpx; }
  .btn { font-size: 24rpx; min-width: 120rpx; }
}
@media (min-width: 750px) {
  .my-container {
    max-width: 700rpx; 
    margin: 0 auto; 
    box-shadow: 0 0 30rpx rgba(0, 0, 0, 0.02);
  }
  .profile-section {
    border-radius: 0 0 36rpx 36rpx; 
  }
}
</style>