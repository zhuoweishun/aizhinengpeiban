// 云函数：晚安图片生成（通义万相 wanx-v1）
// 免费额度：100 张/月
const cloud = require('wx-server-sdk');
const fetch = require('node-fetch');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 导入配置（API 密钥从云函数环境变量读取）
const { DASHSCOPE_CONFIG } = require('../config/env');

const DASHSCOPE_API_KEY = DASHSCOPE_CONFIG.apiKey;

if (!DASHSCOPE_API_KEY) {
  console.error('警告：DASHSCOPE_API_KEY 未配置，请在云函数控制台设置环境变量');
}

// 晚安图提示词模板（温馨治愈风格）
const GOODNIGHT_PROMPTS = [
  '温馨的卧室，月光透过窗户洒在床上，星星在窗外闪烁，治愈系插画风格，柔和色调',
  '可爱的小猫蜷缩在软绵绵的云朵床上，周围有星星和月亮，温暖灯光，治愈系风格',
  '梦幻的星空下，小女孩抱着泰迪熊在云朵上入睡，周围有萤火虫飞舞，温馨治愈',
  '柔和的夕阳余晖，窗边有一杯热可可和一本书，窗外是美丽的晚霞，温馨治愈风格',
  '安静的森林小屋，温暖的灯光从窗户透出，周围有萤火虫，夜空中有星星，治愈系',
  '可爱的小兔子在月亮船上睡觉，周围有星星云朵，梦幻温馨，治愈系插画风格'
];

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { OPENID } = wxContext;
  
  try {
    const { prompt, style = 'random' } = event;
    
    // 如果用户没提供提示词，随机选一个模板
    let finalPrompt = prompt;
    if (!finalPrompt || style === 'random') {
      finalPrompt = GOODNIGHT_PROMPTS[Math.floor(Math.random() * GOODNIGHT_PROMPTS.length)];
    }
    
    console.log('生成晚安图，提示词:', finalPrompt);
    
    // 调用通义万相 API（异步模式）
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable'
      },
      body: JSON.stringify({
        model: 'wanx-v1',
        input: {
          prompt: finalPrompt
        },
        parameters: {
          style: '<auto>',
          size: '1024*1024',
          n: 1
        }
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('通义万相 API 错误:', data);
      return {
        success: false,
        message: data.message || '图片生成失败',
        error: data
      };
    }
    
    // 异步任务，需要轮询获取结果
    const taskId = data.output.task_id;
    console.log('图片生成任务 ID:', taskId);
    
    // 轮询获取结果（最多等待 60 秒）
    const imageUrl = await pollForImageResult(taskId, 60);
    
    if (!imageUrl) {
      return {
        success: false,
        message: '图片生成超时，请稍后再试~'
      };
    }
    
    // 记录生成次数（用于监控免费额度）
    await recordGeneration(OPENID);
    
    return {
      success: true,
      data: {
        imageUrl: imageUrl,
        prompt: finalPrompt,
        timestamp: Date.now()
      }
    };
    
  } catch (error) {
    console.error('晚安图生成错误:', error);
    return {
      success: false,
      message: '瓜瓜画图有点累，请稍后再试~ 🥺',
      error: error.message
    };
  }
};

// 轮询获取图片结果
async function pollForImageResult(taskId, maxWaitSeconds) {
  const startTime = Date.now();
  const maxWaitMs = maxWaitSeconds * 1000;
  
  while (Date.now() - startTime < maxWaitMs) {
    try {
      // 查询任务状态
      const response = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${DASHSCOPE_API_KEY}`
        }
      });
      
      const data = await response.json();
      
      console.log('任务状态:', data.output?.task_status);
      
      if (data.output?.task_status === 'SUCCEEDED') {
        // 成功，返回图片 URL
        const imageUrl = data.output?.results?.[0]?.url;
        return imageUrl;
      } else if (data.output?.task_status === 'FAILED') {
        console.error('图片生成失败:', data);
        return null;
      }
      
      // 等待 2 秒后重试
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error('轮询任务状态失败:', error);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  return null; // 超时
}

// 记录生成次数
async function recordGeneration(userId) {
  try {
    const db = cloud.database();
    
    // 查找本月记录
    const now = new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const existing = await db.collection('imageGenerations')
      .where({
        userId: userId,
        yearMonth: yearMonth
      })
      .limit(1)
      .get();
    
    if (existing.data && existing.data.length > 0) {
      // 更新计数
      await db.collection('imageGenerations')
        .doc(existing.data[0]._id)
        .update({
          data: {
            count: existing.data[0].count + 1,
            updatedAt: Date.now()
          }
        });
    } else {
      // 创建新记录
      await db.collection('imageGenerations').add({
        data: {
          userId: userId,
          yearMonth: yearMonth,
          count: 1,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      });
    }
  } catch (error) {
    console.error('记录生成次数失败:', error);
  }
}