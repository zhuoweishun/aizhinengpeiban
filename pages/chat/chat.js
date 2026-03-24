/**
 * 聊天页面 - AI 陪伴聊天
 */

const app = getApp();
const dateUtil = require('../../utils/date.js');

// 本地存储键名
const STORAGE_CHAT_HISTORY = 'chatHistory';
const STORAGE_CONVERSATION_ID = 'conversationId';

Page({
  data: {
    messages: [],
    inputValue: '',
    loading: false,
    scrollToView: '',
    aiName: '瓜瓜',
    currentTime: '',
    conversationId: ''
  },

  onLoad() {
    this.setData({
      aiName: app.globalData.aiName || '瓜瓜',
      currentTime: this.getCurrentTime()
    });

    // 加载历史消息
    this.loadChatHistory();
  },

  // 加载聊天记录
  loadChatHistory() {
    try {
      const history = wx.getStorageSync(STORAGE_CHAT_HISTORY) || [];
      const conversationId = wx.getStorageSync(STORAGE_CONVERSATION_ID) || '';

      console.log('加载聊天记录:', history.length, '条消息');

      this.setData({
        messages: history,
        conversationId: conversationId
      });

      // 滚动到底部
      if (history.length > 0) {
        const lastMsg = history[history.length - 1];
        this.setData({
          scrollToView: 'msg-' + lastMsg.id
        });
      }
    } catch (error) {
      console.error('加载聊天记录失败:', error);
    }
  },

  // 保存聊天记录
  saveChatHistory() {
    try {
      wx.setStorageSync(STORAGE_CHAT_HISTORY, this.data.messages);
      if (this.data.conversationId) {
        wx.setStorageSync(STORAGE_CONVERSATION_ID, this.data.conversationId);
      }
    } catch (error) {
      console.error('保存聊天记录失败:', error);
    }
  },

  // 选择心情
  selectMood(e) {
    const { mood } = e.currentTarget.dataset;
    const moodMessages = {
      happy: '今天心情很好，想和你分享开心的事~ 😊',
      sad: '今天有点难过，想找你聊聊天~ 😢',
      tired: '感觉好累啊，需要安慰~ 😫',
      chat: '无聊了，想随便聊聊~ 💬'
    };

    const message = moodMessages[mood] || '想和你聊聊天~';
    this.sendMessageWithContent(message);

    wx.showToast({
      title: '心情已记录',
      icon: 'none'
    });
  },

  // 输入变化
  onInputChange(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },

  // 显示表情
  showEmojiPicker() {
    const emojis = ['😄', '😂', '😊', '😍', '🤔', '😎', '😢', '😡', '👍', '👎', '❤️', '🎉'];
    const itemList = emojis.map((e, i) => `${i + 1}. ${e}`);

    wx.showActionSheet({
      itemList,
      success: (res) => {
        const selectedEmoji = emojis[res.tapIndex];
        this.setData({
          inputValue: this.data.inputValue + selectedEmoji
        });
      }
    });
  },

  // 发送消息
  sendMessage() {
    if (!this.data.inputValue.trim()) {
      return;
    }

    const content = this.data.inputValue.trim();
    this.sendMessageWithContent(content);
  },

  // 发送消息（带内容）
  sendMessageWithContent(content) {
    // 添加用户消息
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: content,
      time: this.getCurrentTime()
    };

    this.setData({
      messages: [...this.data.messages, userMessage],
      inputValue: '',
      loading: true,
      scrollToView: 'msg-' + userMessage.id
    });

    // 保存聊天记录
    this.saveChatHistory();

    // 调用云函数获取 AI 回复
    this.callAIAPI(content);
  },

  // 调用云函数获取 AI 回复
  callAIAPI(userContent) {
    wx.cloud.callFunction({
      name: 'chat',
      data: {
        message: userContent,
        conversationId: this.data.conversationId || 'default'
      },
      success: (res) => {
        console.log('AI 回复成功:', res);

        if (res.result && res.result.success) {
          const botMessage = {
            id: Date.now() + 1,
            type: 'bot',
            content: res.result.data.response,
            time: this.getCurrentTime()
          };

          this.setData({
            messages: [...this.data.messages, botMessage],
            loading: false,
            scrollToView: 'msg-' + botMessage.id,
            conversationId: res.result.data.conversationId
          });

          // 保存聊天记录
          this.saveChatHistory();
        } else {
          // API 返回错误
          this.handleAIError(res.result?.message || 'AI 回复失败');
        }
      },
      fail: (err) => {
        console.error('AI 调用失败:', err);
        this.handleAIError('网络连接失败，请检查网络设置');
      }
    });
  },

  // 处理 AI 错误
  handleAIError(errorMsg) {
    const errorMessage = {
      id: Date.now() + 1,
      type: 'error',
      content: '瓜瓜网络不太好，请稍后再试~ 🥺',
      time: this.getCurrentTime(),
      canRetry: true
    };

    this.setData({
      messages: [...this.data.messages, errorMessage],
      loading: false,
      scrollToView: 'msg-' + errorMessage.id
    });

    // 保存聊天记录
    this.saveChatHistory();
  },

  // 重试发送消息
  retryLastMessage() {
    // 找到最后一条错误消息
    const lastErrorIndex = this.data.messages.map(m => m.type).lastIndexOf('error');
    if (lastErrorIndex === -1) return;

    // 找到错误消息前面的用户消息
    let lastUserMessage = null;
    for (let i = lastErrorIndex - 1; i >= 0; i--) {
      if (this.data.messages[i].type === 'user') {
        lastUserMessage = this.data.messages[i].content;
        break;
      }
    }

    if (lastUserMessage) {
      // 移除错误消息
      const messages = this.data.messages.filter((_, idx) => idx !== lastErrorIndex);
      this.setData({ messages, loading: true });

      // 重新调用 API
      this.callAIAPI(lastUserMessage);
    }
  },

  // 清除聊天记录
  clearChatHistory() {
    wx.showModal({
      title: '确认清空聊天记录',
      content: '清空后将无法恢复哦~',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync(STORAGE_CHAT_HISTORY);
          wx.removeStorageSync(STORAGE_CONVERSATION_ID);
          this.setData({
            messages: [],
            conversationId: '',
            scrollToView: ''
          });
          wx.showToast({
            title: '聊天记录已清空',
            icon: 'success'
          });
        }
      }
    });
  },

  // 获取当前时间
  getCurrentTime() {
    return dateUtil.formatTime(new Date());
  },

  // 下拉刷新
  onRefresh() {
    // 加载历史消息
    this.loadChatHistory();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  }
});
