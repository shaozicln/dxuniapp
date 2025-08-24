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
      <block v-for="(item, index) in messageList" :key="item.id"> 
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
import { reactive } from 'vue';
import { navigateToWithLoading } from '@/utils/navigate/navigate';
import { showActionSheet } from 'uni-app';

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

// 消息列表数据
const messageList = reactive<MessageItem[]>([
  { id: 1, title: '系统通知', content: '新系统通知...', unread: true },
  { id: 2, title: '互动消息', content: '学生发来的未读消息', unread: true }, 
  { id: 3, title: '测试消息', content: '未读测试', unread: true }
]);

// 点击消息逻辑
const handleItemTap = (item: MessageItem) => {
  console.log('点击消息:', item);
  // 可扩展：跳转到消息详情页，比如：
  // navigateTo({ url: `/pages/messageDetail/messageDetail?id=${item.id}` });
};

// 取消标红逻辑
const cancelUnread = (index: number) => {
  messageList[index].unread = false;
};

// 删除消息逻辑
const deleteMessage = (index: number) => {
  messageList.splice(index, 1);
};

// 长按事件逻辑（未读标红消息禁止长按）
const handleLongPress = (index: number) => {
  const currentItem = messageList[index];
  if (currentItem.unread) return; 

  uni.showActionSheet({
    itemList: ['恢复标红', '删除', '取消'], // 清晰命名
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

// 跳转个人信息页逻辑
const goToProfile = async () => {
  try {
    await navigateToWithLoading('/pages/personnalMsg/personnalMsg', {
      loadingText: '加载中...',
      onError: (err) => {
        console.warn('跳转异常:', err);
      }
    });
  } catch (err) {
    console.error('跳转个人信息页失败:', err);
  }
};
</script>

<style scoped>
/* 页面基础容器 */
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
  padding:  0 10rpx;
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

/* 消息项容器 */
.message-item {
  padding: 20rpx;
  border-bottom: 1px solid #f0f0f0; 
  display: flex;
  flex-direction: column;
  transition: background-color 0.2s ease; 
  border: 1px solid #e6e6e6; 
  border-radius: 8rpx;
  margin-bottom: 15rpx; /* 调整间距更舒适 */
}

/* 未读消息背景样式 */
.unread {
  background-color: #ffeaea; 
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
  border: none; /* 去掉默认边框 */
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