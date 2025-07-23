
<template>
  <view class="my-container">
    <!-- 个人信息区域，绑定点击跳转事件 -->
    <view class="profile-section" @tap="goToProfile"> 
      <image 
        class="avatar" 
        :src="userInfo.avatarUrl" 
        mode="aspectFill"
      ></image>
      <view class="user-info-wrapper">
        <view class="user-info">
          <text class="nickname">{{ userInfo.nickname }}</text>
          <text class="desc">用户身份</text>
        </view>
      </view>
    </view>

    <!-- 消息列表区域 -->
    <view class="message-section">
      <view class="section-title">消息列表</view>
      <block v-for="(item, index) in messageList" :key="item.id"> <!-- 改用item.id作为key更规范 -->
        <view 
          class="message-item" 
          :class="{ unread: item.unread }"
          @tap="handleItemTap(item)"
        >
          <text class="message-title">{{ item.title }}</text>
          <text class="message-content">{{ item.content }}</text>
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
      </block>
    </view>
  </view>
</template>
<script setup lang="ts">
import { reactive } from 'vue';
import { navigateToWithLoading } from '@/utils/navigate/navigate';

// 类型定义集中管理
interface UserInfo {
  avatarUrl: string;
  nickname: string;
}

interface MessageItem {
  id: number;
  title: string;
  content: string;
  unread: boolean;
}

// 响应式数据
const userInfo = reactive<UserInfo>({
  avatarUrl: '/static/default-avatar.png', 
  nickname: '用户姓名' 
});

const messageList = reactive<MessageItem[]>([
  { id: 1, title: '系统通知', content: '新系统通知...', unread: true },
  { id: 2, title: '互动消息', content: '收到点赞', unread: false },
  { id: 3, title: '测试消息', content: '未读测试', unread: true }
]);

// 方法逻辑
const handleItemTap = (item: MessageItem) => {
  console.log('点击消息:', item);
  // 可扩展：跳转到消息详情页
};

const cancelUnread = (index: number) => {
  messageList[index].unread = false;
};

const deleteMessage = (index: number) => {
  messageList.splice(index, 1);
};

const goToProfile = async () => {
  try {
    await navigateToWithLoading('/pages/personnalMsg/personnalMsg', {
      loadingText: '加载中...',
      onError: (err) => {
        console.warn('跳转异常:', err);
      }
    });
  } catch (err) {
    // 统一错误捕获
  }
};
</script>

<style scoped>
/* 保持原有样式不变 */
.my-container {
  display: flex;
  flex-direction: column;
  background-color: #F0FFF0;
  min-height: 100vh;
}

.profile-section {
  position: relative;
  width: 100%;
  height: 30vh;
  background: linear-gradient(to bottom , #87CEEB, #F0FFF0);
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 40rpx;
  box-sizing: border-box;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 3rpx solid #87CEEB;
  margin-right: 10rpx;
}

.user-info-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.nickname {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
}

.desc {
  font-size: 28rpx;
  color: #666;
  margin-top: 5rpx;
  text-align: center;
}

.message-section {
  flex: 1;
  padding: 20rpx;
  box-sizing: border-box;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  border-left: 10rpx solid #0f0;
  padding-left: 10rpx;
}

.message-item {
  padding: 20rpx;
  border-bottom: 1px solid #eee;
  display: flex;
  flex-direction: column;
}

.unread {
  background-color: #ffe6e6;
}

.message-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.message-content {
  font-size: 26rpx;
  color: #666;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 10rpx;
}

.btn {
  margin-left: 20rpx;
  padding: 10rpx 20rpx;
  border-radius: 8rpx;
}

.cancel-unread {
  background-color: #0f0;
  color: #fff;
}

.delete-msg {
  background-color: #f00;
  color: #fff;
}
</style>