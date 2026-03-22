/**
 * 植物识别工具
 * 使用 Qwen-VL 多模态模型识别植物
 */

const API_KEY = 'sk-d43b58a6d0dd486d89b69a38f305483a';
const API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';

/**
 * 识别植物
 * @param {string} imageBase64 - 图片的 base64 编码
 * @returns {Promise<Object>} 识别结果
 */
const identifyPlant = async (imageBase64) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen-vl-plus',
        input: {
          messages: [
            {
              role: 'user',
              content: [
                { image: imageBase64 },
                { 
                  text: `请识别这张图片中的植物，并以 JSON 格式返回以下信息：
{
  "name": "植物名称",
  "scientificName": "学名",
  "family": "科属",
  "confidence": 0.95,
  "description": "简短描述",
  "careGuide": {
    "light": "光照需求",
    "water": "浇水频率",
    "temperature": "适宜温度",
    "humidity": "湿度要求",
    "fertilizer": "施肥建议",
    "tips": "养护技巧"
  },
  "difficulty": "养殖难度（简单/中等/困难）",
  "toxicity": "是否有毒",
  "features": ["特点1", "特点2"]
}`
                }
              ]
            }
          ]
        },
        parameters: {
          max_tokens: 1000,
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    
    // 解析返回内容
    const content = data.output?.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('AI 未返回有效内容');
    }

    // 提取 JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        data: result
      };
    }

    // 如果没有 JSON，返回原始内容
    return {
      success: true,
      data: {
        name: '未知植物',
        description: content
      }
    };

  } catch (error) {
    console.error('植物识别错误:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 压缩图片
 * @param {string} tempFilePath - 临时文件路径
 * @param {number} quality - 压缩质量 0-100
 * @returns {Promise<string>} 压缩后的 base64
 */
const compressImage = (tempFilePath, quality = 80) => {
  return new Promise((resolve, reject) => {
    wx.compressImage({
      src: tempFilePath,
      quality: quality,
      success: (res) => {
        // 读取文件为 base64
        wx.getFileSystemManager().readFile({
          filePath: res.tempFilePath,
          encoding: 'base64',
          success: (res) => {
            resolve(res.data);
          },
          fail: reject
        });
      },
      fail: reject
    });
  });
};

/**
 * 拍照识别
 * @returns {Promise<Object>} 识别结果
 */
const takePhotoAndIdentify = () => {
  return new Promise((resolve, reject) => {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera', 'album'],
      success: async (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        
        wx.showLoading({ title: '识别中...' });
        
        try {
          // 压缩并转为 base64
          const base64 = await compressImage(tempFilePath);
          
          // 识别
          const result = await identifyPlant(base64);
          
          wx.hideLoading();
          
          resolve({
            ...result,
            imagePath: tempFilePath
          });
          
        } catch (error) {
          wx.hideLoading();
          reject(error);
        }
      },
      fail: reject
    });
  });
};

module.exports = {
  identifyPlant,
  compressImage,
  takePhotoAndIdentify
};