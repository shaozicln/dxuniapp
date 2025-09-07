<template>
  <view class="my-container">
    <view class="profile-section" @tap="goToProfile"> 
      <image 
        class="avatar" 
        :src="userInfo.avatarUrl" 
        mode="aspectFill"
        lazy-load 
      ></image>
      <view class="user-info-wrapper">
        <view class="user-info">
          <text class="nickname">{{ userInfo.name }}</text>
          <text class="desc">用户当前身份为：{{ userRole }}</text>
        </view>
      </view>
    </view>

    <!-- 消息列表区域 -->
    <view class="message-section">
      <view class="section-title">消息列表</view>
      <view v-if="messageList.length === 0" class="empty-tip">暂无消息</view>
      <block v-else v-for="(item, index) in messageList" :key="item.id"> 
        <view 
          class="message-item" 
          :class="{ unread: item.unread }"
          @tap="handleItemTap(item)"
          @longpress="handleLongPress(index)"
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

import { reactive, onMounted, ref } from 'vue';
import { navigateToWithLoading } from '../../src/utils/navigate/navigate'; 

interface UserInfo {
  avatarUrl?: string;
  name: string;
  teacherId?: string;
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
  name: '未登录'
});
const userRole = ref<string>('未登录'); // 存储判断后的身份
const messageList = reactive<MessageItem[]>([
  { id: 1, title: '系统通知', content: '新系统通知...', unread: true },
  { id: 2, title: '互动消息', content: '学生发来的未读消息', unread: true }, 
  { id: 3, title: '测试消息', content: '未读测试', unread: true }
]);

onMounted(() => {
  try {
    const storedUserInfo = uni.getStorageSync('userInfo') as UserInfo;

    if (storedUserInfo && storedUserInfo.name) {
      userInfo.name = storedUserInfo.name;
      if (storedUserInfo.avatarUrl) {
        userInfo.avatarUrl = storedUserInfo.avatarUrl;
      }

      const teacherId = storedUserInfo.teacherId || '';
      userRole.value = teacherId.startsWith('Z') ? '老师' : '学生';

      console.log('读取本地用户信息成功，身份：', userRole.value);
    } else {
      console.warn('本地用户信息不完整');
      userRole.value = '未登录';
    }
  } catch (err) {
    console.error('读取用户信息失败:', err);
    userRole.value = '身份未知';
  }
});
const handleItemTap = (item: MessageItem) => {
  console.log('点击消息:', item);
  if (item.unread) {
    const index = messageList.findIndex(msg => msg.id === item.id);
    if (index !== -1) messageList[index].unread = false;
  }
};

const cancelUnread = (index: number) => {
  messageList[index].unread = false;
};

const deleteMessage = (index: number) => {
  messageList.splice(index, 1);
};

const handleLongPress = (index: number) => {
  const currentItem = messageList[index];
  if (currentItem.unread) return; 

  uni.showActionSheet({
    itemList: ['恢复标红', '删除', '取消'],
    success: (res) => {
      if (res.tapIndex === 0) {
        currentItem.unread = true; 
      } else if (res.tapIndex === 1) {
        deleteMessage(index);
      }
    },
    fail: (err) => {
      console.warn('长按菜单调用失败:', err);
    }
  });
};

const goToProfile = async () => {
  try {
    await navigateToWithLoading('/pages/personalMsg/personalMsg', {
      loadingText: '加载中...',
      onError: (err) => {
        console.warn('跳转异常:', err);
        uni.showToast({ title: '跳转失败', icon: 'none' }); 
      }
    });
  } catch (err) {
    console.error('跳转个人信息页失败:', err);
    uni.showToast({ title: '跳转失败', icon: 'none' });
  }
};
</script>
<style scoped>

.my-container {
  display: flex;
  flex-direction: column;
  background-color: #f8fef8; 
  min-height: 100vh;
}

/* 个人信息区域 */
.profile-section {
  position: relative;
  width: 100%;
  height: 30vh;
  background: linear-gradient(to bottom, #c9edf5, #f8fef8); 
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 40rpx;
  box-sizing: border-box;
  margin-bottom: 0;
}

/* 头像样式 */
.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 3rpx solid #c9edf5; 
  margin-right: 20rpx; 
  object-fit: cover;
}

/* 用户信息包裹层 */
.user-info-wrapper {
  flex: 1;
  display: flex;
  justify-content: flex-start; 
  align-items: center;
}

/* 用户信息内容 */
.user-info {
  display: flex;
  flex-direction: column;
}

/* 昵称样式 */
.nickname {
  font-size: 36rpx;
  font-weight: bold;
  color: #444; 
  text-align: left; 
}

/* 描述文本样式 */
.desc {
  font-size: 28rpx;
  color: #777; 
  margin-top: 8rpx;
  text-align: left;
}

/* 消息列表区域 */
.message-section {
  flex: 1;
  padding: 20rpx 10rpx;
  box-sizing: border-box;
}

/* 板块标题样式 */
.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  border-left: 10rpx solid #90ee90; 
  padding-left: 10rpx;
}

/* 空列表提示 */
.empty-tip {
  font-size: 28rpx;
  color: #999;
  text-align: center;
  padding: 50rpx 0;
}

/* 消息项容器 */
.message-item {
  padding: 20rpx;
  border-bottom: 1px solid #f0f0f0; 
  display: flex;
  flex-direction: column;
  transition: background-color 0.2s ease; 
  border: 1px solid #e6e6e6; 
  border-radius: 8rpx;
  margin-bottom: 15rpx;
  background-color: #fff;
}

/* 未读消息背景样式 */
.unread {
  background-color: #ffeaea; 
  border-color: #ffcccc;
}

/* 消息标题样式 */
.message-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

/* 消息内容样式 */
.message-content {
  font-size: 26rpx;
  color: #666; 
  line-height: 1.6; 

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 操作按钮容器 */
.action-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 15rpx; 
}

/* 按钮基础样式 */
.btn {
  margin-left: 20rpx;
  padding: 12rpx 24rpx; 
  border-radius: 8rpx;
  font-size: 24rpx; 
  border: none;
}

/* 取消标红按钮样式 */
.cancel-unread {
  background-color: #70d770; 
  color: #fff;
}

/* 删除按钮样式 */
.delete-msg {
  background-color: #f75757; 
  color: #fff;
}

/* 按钮点击反馈 */
.btn:active {
  opacity: 0.8;
  transform: scale(0.98);
}
</style>