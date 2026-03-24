// 云函数：加入宿舍
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

// 自动分配称呼 - 使用工具函数
const { autoAssignTitle } = require('../../utils/dormitory-title');

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { OPENID } = wxContext;
  
  try {
    const { dormitoryId, nickname } = event;
    
    if (!dormitoryId) {
      return {
        success: false,
        message: '宿舍 ID 不能为空'
      };
    }
    
    // 检查用户是否已加入宿舍
    const existingMember = await db.collection('members').where({
      userId: OPENID
    }).get();
    
    if (existingMember.data.length > 0) {
      return {
        success: false,
        message: '您已经加入了一个宿舍'
      };
    }
    
    // 获取宿舍信息
    const dormitory = await db.collection('dormitories').doc(dormitoryId).get();
    
    if (!dormitory.data) {
      return {
        success: false,
        message: '宿舍不存在'
      };
    }
    
    // 检查人数是否已满
    if (dormitory.data.memberCount >= dormitory.data.capacity) {
      return {
        success: false,
        message: '宿舍人数已满'
      };
    }
    
    // 获取当前成员数量，用于分配称呼
    const members = await db.collection('members').where({
      dormitoryId: dormitoryId
    }).get();
    
    const memberCount = members.data.length;
    
    // 自动分配称呼
    const title = autoAssignTitle(memberCount + 1);
    
    // 创建成员记录
    const now = Date.now();
    await db.collection('members').add({
      data: {
        dormitoryId: dormitoryId,
        userId: OPENID,
        nickname: nickname || '舍友',
        title: title,
        customTitle: '',
        joinedAt: now,
        activeDays: 1,
        moodCount: 0,
        goodnightCount: 0,
        lastActiveDate: now
      }
    });
    
    // 更新宿舍人数
    await db.collection('dormitories').doc(dormitoryId).update({
      data: {
        memberCount: memberCount + 1
      }
    });
    
    return {
      success: true,
      title: title,
      message: '加入宿舍成功，您的称呼是：' + title
    };
    
  } catch (error) {
    console.error('加入宿舍失败:', error);
    return {
      success: false,
      message: '加入失败：' + error.message
    };
  }
};

