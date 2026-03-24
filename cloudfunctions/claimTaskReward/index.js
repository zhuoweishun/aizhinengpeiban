// 云函数：领取任务奖励
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

// 获取本周开始时间 - 使用工具函数
const { getWeekStart } = require('../../utils/dormitory-title');

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { OPENID } = wxContext;
  
  try {
    const { taskId, taskType, taskCategory, dormitoryId } = event;
    
    // 参数验证
    if (!taskId && !taskType) {
      return {
        success: false,
        message: '任务 ID 或任务类型不能为空'
      };
    }
    
    // 兼容处理：如果没有传 taskType，从 taskId 推断
    const finalTaskType = taskType || taskId;
    const finalTaskId = taskId || taskType;
    
    // 获取用户信息
    const userResult = await db.collection('members').where({
      userId: OPENID
    }).get();
    
    if (userResult.data.length === 0) {
      return {
        success: false,
        message: '用户不存在'
      };
    }
    
    const user = userResult.data[0];
    
    // 任务奖励配置
    const taskRewards = {
      // 每日任务
      'morning_checkin': { rewardExp: 10, rewardPoints: 10, rewardType: 'starlight', dailyLimit: 1 },
      'night_checkin': { rewardExp: 20, rewardPoints: 20, rewardType: 'starlight', dailyLimit: 1 },
      'share_mood': { rewardExp: 15, rewardPoints: 15, rewardType: 'starlight', dailyLimit: 3 },
      'view_roommate_mood': { rewardExp: 5, rewardPoints: 5, rewardType: 'starlight', dailyLimit: 5 },
      'like_roommate_post': { rewardExp: 3, rewardPoints: 3, rewardType: 'starlight', dailyLimit: 10 },
      // 每周挑战
      'weekly_full_attendance': { rewardExp: 100, rewardPoints: 100, rewardType: 'starlight', weeklyLimit: 1 },
      'weekly_share_master': { rewardExp: 80, rewardPoints: 80, rewardType: 'starlight', weeklyLimit: 1 },
      'weekly_interaction_star': { rewardExp: 150, rewardPoints: 150, rewardType: 'starlight', weeklyLimit: 1 },
      // 宿舍集体任务
      'dormitory_goodnight': { rewardExp: 50, rewardPoints: 50, rewardType: 'starlight', dailyLimit: 1 },
      'dormitory_mood': { rewardExp: 30, rewardPoints: 30, rewardType: 'starlight', dailyLimit: 1 },
      'dormitory_night_talk': { rewardExp: 40, rewardPoints: 40, rewardType: 'starlight', weeklyLimit: 1 }
    };
    
    const rewardConfig = taskRewards[finalTaskType];
    if (!rewardConfig) {
      return {
        success: false,
        message: '任务配置不存在'
      };
    }
    
    const now = Date.now();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();
    const todayEnd = todayStart + 24 * 60 * 60 * 1000;
    
    // 获取本周开始时间（周一）
    const weekStart = getWeekStart(todayStart);
    const weekEnd = weekStart + 7 * 24 * 60 * 60 * 1000;
    
    // 防刷机制：检查领取限制
    const timeField = rewardConfig.dailyLimit ? 'completedAt' : 'completedAt';
    const timeStart = rewardConfig.dailyLimit ? todayStart : weekStart;
    const timeEnd = rewardConfig.dailyLimit ? todayEnd : weekEnd;
    
    const existingRecords = await db.collection('taskRecords').where({
      userId: OPENID,
      taskType: finalTaskType,
      completedAt: _.gte(timeStart).and(_.lt(timeEnd)),
      claimed: true
    }).get();
    
    const limit = rewardConfig.dailyLimit || rewardConfig.weeklyLimit || 1;
    if (existingRecords.data.length >= limit) {
      return {
        success: false,
        message: '任务奖励已达领取上限'
      };
    }
    
    // 服务器端验证任务完成条件
    const taskCompleted = await verifyTaskCompletion(OPENID, finalTaskType, user.dormitoryId, todayStart, todayEnd, weekStart, weekEnd);
    
    if (!taskCompleted) {
      return {
        success: false,
        message: '任务尚未完成，无法领取奖励'
      };
    }
    
    // 开启事务
    const transaction = await db.startTransaction();
    
    try {
      // 1. 创建任务完成记录（如果还没有）
      const existingTaskRecord = await db.collection('taskRecords').where({
        userId: OPENID,
        taskType: finalTaskType,
        completedAt: _.gte(timeStart).and(_.lt(timeEnd))
      }).get();
      
      let taskRecordId;
      
      if (existingTaskRecord.data.length === 0) {
        // 创建新记录
        const addResult = await transaction.collection('taskRecords').add({
          data: {
            userId: OPENID,
            dormitoryId: user.dormitoryId,
            taskId: finalTaskId,
            taskType: finalTaskType,
            taskCategory: taskCategory || getTaskCategory(finalTaskType),
            rewardType: rewardConfig.rewardType,
            rewardAmount: rewardConfig.rewardPoints,
            completedAt: now,
            claimed: true,
            claimedAt: now
          }
        });
        taskRecordId = addResult._id;
      } else {
        // 更新已有记录为已领取
        await transaction.collection('taskRecords').doc(existingTaskRecord.data[0]._id).update({
          data: {
            claimed: true,
            claimedAt: now
          }
        });
        taskRecordId = existingTaskRecord.data[0]._id;
      }
      
      // 2. 发放奖励（积分 + 经验值）
      const updateData = {};
      
      if (rewardConfig.rewardType === 'starlight') {
        updateData.starlightPoints = _.inc(rewardConfig.rewardPoints);
        updateData.totalStarlight = _.inc(rewardConfig.rewardPoints);
      } else if (rewardConfig.rewardType === 'crystal') {
        updateData.crystalDiamonds = _.inc(rewardConfig.rewardPoints);
        updateData.totalCrystal = _.inc(rewardConfig.rewardPoints);
      }
      
      // 增加经验值
      updateData.personalExp = _.inc(rewardConfig.rewardExp);
      
      await transaction.collection('members').doc(user._id).update({
        data: updateData
      });
      
      // 3. 记录积分流水
      await transaction.collection('pointsFlow').add({
        data: {
          userId: OPENID,
          dormitoryId: user.dormitoryId,
          flowType: 'earn',
          pointsType: rewardConfig.rewardType,
          amount: rewardConfig.rewardPoints,
          source: 'task_reward',
          sourceId: taskRecordId,
          description: `完成任务奖励：${finalTaskType}`,
          createdAt: now
        }
      });
      
      await transaction.commit();
      
      // 4. 检查成就解锁
      const achievements = await checkAchievements(OPENID, user);
      
      // 计算新等级（每 100 经验升 1 级）
      const newExp = (user.personalExp || 0) + rewardConfig.rewardExp;
      const newLevel = Math.floor(newExp / 100) + 1;
      
      // 记录日志
      console.log(`用户 ${OPENID} 领取任务奖励：${finalTaskType}, 获得 ${rewardConfig.rewardPoints} ${rewardConfig.rewardType}`);
      
      return {
        success: true,
        message: `领取成功！获得 ${rewardConfig.rewardPoints} ${rewardConfig.rewardType === 'starlight' ? '星光值 🌟' : '晶钻 💎'}`,
        data: {
          taskId: finalTaskId,
          rewardExp: rewardConfig.rewardExp,
          rewardPoints: rewardConfig.rewardPoints,
          rewardType: rewardConfig.rewardType,
          newStarlight: rewardConfig.rewardType === 'starlight' ? (user.starlightPoints || 0) + rewardConfig.rewardPoints : user.starlightPoints,
          newLevel: newLevel,
          achievements: achievements
        }
      };
      
    } catch (transactionError) {
      await transaction.rollback();
      console.error('事务处理失败:', transactionError);
      throw transactionError;
    }
    
  } catch (error) {
    console.error('领取任务奖励失败:', error);
    return {
      success: false,
      message: '领取失败：' + error.message
    };
  }
};

// 获取任务分类
function getTaskCategory(taskType) {
  if (taskType.startsWith('weekly_')) {
    return 'weekly';
  } else if (taskType.startsWith('dormitory_')) {
    return 'dormitory';
  }
  return 'daily';
}

// 服务器端验证任务完成条件
async function verifyTaskCompletion(userId, taskType, dormitoryId, todayStart, todayEnd, weekStart, weekEnd) {
  try {
    // 每日任务：检查今日完成次数
    if (taskType === 'morning_checkin' || taskType === 'night_checkin') {
      const records = await db.collection('taskRecords').where({
        userId: userId,
        taskType: taskType,
        completedAt: _.gte(todayStart).and(_.lt(todayEnd))
      }).get();
      return records.data.length >= 1;
      
    } else if (taskType === 'share_mood') {
      const records = await db.collection('taskRecords').where({
        userId: userId,
        taskType: taskType,
        completedAt: _.gte(todayStart).and(_.lt(todayEnd))
      }).get();
      return records.data.length >= 3;
      
    } else if (taskType === 'view_roommate_mood') {
      const records = await db.collection('taskRecords').where({
        userId: userId,
        taskType: taskType,
        completedAt: _.gte(todayStart).and(_.lt(todayEnd))
      }).get();
      return records.data.length >= 5;
      
    } else if (taskType === 'like_roommate_post') {
      const records = await db.collection('taskRecords').where({
        userId: userId,
        taskType: taskType,
        completedAt: _.gte(todayStart).and(_.lt(todayEnd))
      }).get();
      return records.data.length >= 10;
      
    } 
    // 每周挑战
    else if (taskType === 'weekly_full_attendance') {
      const checkInRecords = await db.collection('checkInRecords')
        .where({
          userId: userId,
          checkInDate: _.gte(weekStart).and(_.lt(weekEnd))
        })
        .get();
      
      const uniqueDays = new Set();
      checkInRecords.data.forEach(record => {
        const date = new Date(record.checkInDate);
        date.setHours(0, 0, 0, 0);
        uniqueDays.add(date.getTime());
      });
      
      return uniqueDays.size >= 7;
      
    } else if (taskType === 'weekly_share_master') {
      const records = await db.collection('taskRecords').where({
        userId: userId,
        taskType: 'share_mood',
        completedAt: _.gte(weekStart).and(_.lt(weekEnd))
      }).get();
      return records.data.length >= 5;
      
    } else if (taskType === 'weekly_interaction_star') {
      const records = await db.collection('taskRecords').where({
        userId: userId,
        taskType: 'like_roommate_post',
        completedAt: _.gte(weekStart).and(_.lt(weekEnd))
      }).get();
      return records.data.length * 10 >= 50;
      
    }
    // 宿舍集体任务
    else if (taskType === 'dormitory_goodnight') {
      const members = await db.collection('members').where({
        dormitoryId: dormitoryId
      }).get();
      
      let count = 0;
      for (const member of members.data) {
        const records = await db.collection('taskRecords').where({
          userId: member.userId,
          taskType: 'night_checkin',
          completedAt: _.gte(todayStart).and(_.lt(todayEnd))
        }).get();
        
        if (records.data.length > 0) {
          count++;
        }
      }
      
      return count >= Math.min(4, members.data.length);
      
    } else if (taskType === 'dormitory_mood') {
      const members = await db.collection('members').where({
        dormitoryId: dormitoryId
      }).get();
      
      let count = 0;
      for (const member of members.data) {
        const records = await db.collection('taskRecords').where({
          userId: member.userId,
          taskType: 'share_mood',
          completedAt: _.gte(todayStart).and(_.lt(todayEnd))
        }).get();
        
        if (records.data.length > 0) {
          count++;
        }
      }
      
      return count >= Math.min(4, members.data.length);
      
    } else if (taskType === 'dormitory_night_talk') {
      // TODO: 需要实现留言板互动统计
      return false;
    }
    
  } catch (error) {
    console.error('验证任务完成失败:', error);
  }
  
  return false;
}

// 检查成就解锁
async function checkAchievements(userId, user) {
  const achievements = [];
  
  try {
    const userAchievements = user.achievements || [];
    const achievementIds = userAchievements.map(a => a.id);
    
    // 任务完成成就配置
    const taskAchievements = [
      { id: 'task_10', name: '初出茅庐', description: '完成 10 个任务', requirement: 10, reward: 50 },
      { id: 'task_50', name: '任务达人', description: '完成 50 个任务', requirement: 50, reward: 200 },
      { id: 'task_100', name: '任务大师', description: '完成 100 个任务', requirement: 100, reward: 500 }
    ];
    
    // 统计已完成任务数
    const totalTasksResult = await db.collection('taskRecords').where({
      userId: userId
    }).get();
    
    const totalTasks = totalTasksResult.data.length;
    
    for (const achievement of taskAchievements) {
      if (totalTasks >= achievement.requirement && !achievementIds.includes(achievement.id)) {
        achievements.push({
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          reward: achievement.reward,
          unlockedAt: Date.now()
        });
        
        userAchievements.push({
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          reward: achievement.reward,
          unlockedAt: Date.now()
        });
      }
    }
    
    // 更新用户成就
    if (achievements.length > 0) {
      await db.collection('members').doc(user._id).update({
        data: {
          achievements: userAchievements
        }
      });
      
      // 发放成就奖励
      for (const achievement of achievements) {
        await db.collection('members').doc(user._id).update({
          data: {
            starlightPoints: _.inc(achievement.reward),
            totalStarlight: _.inc(achievement.reward)
          }
        });
        
        console.log(`用户 ${userId} 解锁成就：${achievement.name}`);
      }
    }
    
  } catch (error) {
    console.error('检查成就失败:', error);
  }
  
  return achievements;
}
