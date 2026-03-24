// 云函数：AI 聊天（通义千问 Plus）- 优化版 v2.0
// 改造内容：对话历史持久化 + 升级 qwen-plus + 优化人设
const cloud = require('wx-server-sdk');
const fetch = require('node-fetch');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

// 导入配置（API 密钥从云函数环境变量读取）
const { DASHSCOPE_CONFIG, SYSTEM_PROMPT } = require('../config/env');

// 通义千问 API 配置
const DASHSCOPE_API_URL = DASHSCOPE_CONFIG.apiUrl;
const DASHSCOPE_API_KEY = DASHSCOPE_CONFIG.apiKey;

if (!DASHSCOPE_API_KEY) {
  console.error('警告：DASHSCOPE_API_KEY 未配置，请在云函数控制台设置环境变量');
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { OPENID } = wxContext;
  
  try {
    const { message, conversationId = 'default' } = event;
    
    if (!message || typeof message !== 'string') {
      return {
        success: false,
        message: '消息内容不能为空'
      };
    }
    
    // 1. 从数据库加载对话历史
    let conversation = await loadConversation(OPENID, conversationId);
    
    // 2. 构建消息列表
    let messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversation.messages
    ];
    
    // 3. 添加用户消息
    messages.push({
      role: 'user',
      content: message
    });
    
    // 4. 保持历史记录在合理长度（最近 10 轮对话）
    if (messages.length > 22) {
      messages = [
        messages[0], // system
        ...messages.slice(-21)
      ];
    }
    
    // 5. 调用通义千问 API（qwen-plus）
    const response = await callQwenAPI(messages);
    
    if (!response.success) {
      return {
        success: false,
        message: response.error || 'AI 回复失败'
      };
    }
    
    // 6. 添加 AI 回复到消息列表
    messages.push({
      role: 'assistant',
      content: response.content
    });
    
    // 7. 保存对话到数据库
    await saveConversation(OPENID, conversationId, messages.slice(1)); // 去掉 system
    
    // 8. 同时保存单条记录（用于统计分析）
    await saveChatRecord(OPENID, conversationId, message, response.content);
    
    return {
      success: true,
      data: {
        response: response.content,
        conversationId: conversationId,
        timestamp: Date.now()
      }
    };
    
  } catch (error) {
    console.error('AI 聊天错误:', error);
    return {
      success: false,
      message: '瓜瓜暂时有点累，请稍后再试~ 🥺',
      error: error.message
    };
  }
};

// 从数据库加载对话历史
async function loadConversation(userId, conversationId) {
  try {
    const result = await db.collection('conversations')
      .where({
        userId: userId,
        conversationId: conversationId
      })
      .orderBy('updatedAt', 'desc')
      .limit(1)
      .get();
    
    if (result.data && result.data.length > 0) {
      return {
        _id: result.data[0]._id,
        messages: result.data[0].messages || []
      };
    }
    
    return {
      _id: null,
      messages: []
    };
  } catch (error) {
    console.error('加载对话历史失败:', error);
    return {
      _id: null,
      messages: []
    };
  }
}

// 保存对话到数据库
async function saveConversation(userId, conversationId, messages) {
  try {
    const now = Date.now();
    
    // 查找是否已存在
    const existing = await db.collection('conversations')
      .where({
        userId: userId,
        conversationId: conversationId
      })
      .limit(1)
      .get();
    
    if (existing.data && existing.data.length > 0) {
      // 更新现有记录
      await db.collection('conversations')
        .doc(existing.data[0]._id)
        .update({
          data: {
            messages: messages,
            updatedAt: now
          }
        });
    } else {
      // 创建新记录
      await db.collection('conversations').add({
        data: {
          userId: userId,
          conversationId: conversationId,
          messages: messages,
          createdAt: now,
          updatedAt: now
        }
      });
    }
  } catch (error) {
    console.error('保存对话失败:', error);
    // 不抛出错误，避免影响主流程
  }
}

// 保存单条聊天记录（用于统计分析）
async function saveChatRecord(userId, conversationId, userMessage, botResponse) {
  try {
    await db.collection('chatRecords').add({
      data: {
        userId: userId,
        conversationId: conversationId,
        userMessage: userMessage,
        botResponse: botResponse,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    console.error('保存聊天记录失败:', error);
    // 不抛出错误，避免影响主流程
  }
}

// 调用通义千问 API（qwen-plus）
async function callQwenAPI(messages) {
  try {
    const response = await fetch(DASHSCOPE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen-plus', // 升级到 qwen-plus（7000万Tokens免费）
        messages: messages,
        temperature: 0.7,
        max_tokens: 200 // 控制回复长度
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('通义千问 API 错误:', data);
      return {
        success: false,
        error: data.message || 'API 调用失败'
      };
    }
    
    // 解析响应（OpenAI 兼容格式）
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      return {
        success: false,
        error: 'AI 返回内容为空'
      };
    }
    
    return {
      success: true,
      content: content
    };
    
  } catch (error) {
    console.error('调用通义千问失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}