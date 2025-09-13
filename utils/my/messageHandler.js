// 消息处理工具
export const messageHandler = {
//处理消息点击事件
  handleItemTap(messageList, item, index) {
    if (!this.isValidMessageIndex(messageList, item, index)) return;
    console.log('点击消息：', item);
    if (item.unread) {
      messageList[index].unread = false;
    }
  },
//取消消息标红
  cancelUnread(messageList, index) {
    if (!this.isValidIndex(messageList, index)) return;
    
    messageList[index].unread = false;
    uni.showToast({ title: '已取消标红', icon: 'none', duration: 1200 });
  },
//显示删除确认弹窗
  showDeleteConfirm(index) {
    return new Promise((resolve) => {
      uni.showModal({
        title: '确认删除',
        content: '此消息删除后不可恢复，是否继续？',
        mask: true,
        success: (res) => resolve(res.confirm),
        fail: (err) => {
          console.warn('删除确认弹窗调用失败：', err);
          resolve(false);
        }
      });
    });
  },

//删除消息
  async deleteMessage(messageList, index) {
    if (!this.isValidIndex(messageList, index)) return;
    
    const confirm = await this.showDeleteConfirm(index);
    if (!confirm) return;
    
    messageList.splice(index, 1);
    uni.showToast({ title: '消息已删除', icon: 'none', duration: 1200 });
  },
  
//处理消息长按事件
  handleLongPress(messageList, item, index) {
    if (!this.isValidMessageIndex(messageList, item, index)) return;
    
    // 未读消息禁止长按操作
    if (item.unread) {
      uni.showToast({ 
        title: '未读消息暂不支持长按操作', 
        icon: 'none', 
        duration: 1500 
      });
      return;
    }

    uni.showActionSheet({
      itemList: ['恢复标红', '删除'],
      itemColor: '#333',
      mask: true,
      success: (res) => {
        if (res.cancel) return;
        
        switch (res.tapIndex) {
          case 0: // 恢复标红
            messageList[index].unread = true;
            uni.showToast({ title: '已恢复标红', icon: 'none', duration: 1200 });
            break;
          case 1: // 删除
            this.deleteMessage(messageList, index);
            break;
        }
      },
      fail: (err) => {
        console.warn('长按操作菜单调用失败：', err);
      }
    });
  },

//计算未读消息数量
  getUnreadCount(messageList) {
    return (messageList || []).filter(item => item?.unread).length;
  },

//验证消息索引有效性
  isValidMessageIndex(messageList, item, index) {
	  //!! 是 JavaScript 中将值转为布尔值的简写
    return !!item && this.isValidIndex(messageList, index);
  },

//验证索引有效性
  isValidIndex(list, index) {
    return Array.isArray(list) && index >= 0 && index < list.length;
  }
};
