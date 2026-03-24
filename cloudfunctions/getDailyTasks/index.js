// 云函数：获取每日任务
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
    const dormitoryId = user.dormitoryId;
    
    // 获取宿舍成员信息
    const dormitoryMembers = await db.collection('members').where({
      dormitoryId: dormitoryId
    }).get();
    
    const now = Date.now();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();
    const todayEnd = todayStart + 24 * 60 * 60 * 1000;
    
    // 获取本周开始时间（周一）
    const weekStart = getWeekStart(todayStart);
    const weekEnd = weekStart + 7 * 24 * 60 * 60 * 1000;
    
    // 获取用户今日已完成的任务（用于判断是否完成）
    const completedTasksResult = await db.collection('taskRecords').where({
      userId: OPENID,
      completedAt: _.gte(todayStart).and(_.lt(todayEnd))
    }).get();
    
    // 获取用户已领取奖励的任务
    const claimedTasksResult = await db.collection('taskRecords').where({
      userId: OPENID,
      completedAt: _.gte(todayStart).and(_.lt(todayEnd)),
      claimed: true
    }).get();
    
    const claimedTaskTypes = claimedTasksResult.data.map(t => t.taskType);
    const completedTaskMap = {};
    completedTasksResult.data.forEach(t => {
      if (!completedTaskMap[t.taskType]) {
        completedTaskMap[t.taskType] = { count: 0, completed: true };
      }
      completedTaskMap[t.taskType].count++;
    });
    
    // 任务配置 - 每日任务
    const dailyTasks = [
      {
        id: 'morning_checkin',
        name: '早安打卡',
        description: '新的一天，向舍友们问声早安吧！',
        target: 1,
        current: completedTaskMap['morning_checkin'] ? completedTaskMap['morning_checkin'].count : 0,
        rewardExp: 10,
        rewardPoints: 10,
        rewardType: 'starlight',
        icon: '🌅',
        completed: (completedTaskMap['morning_checkin'] ? completedTaskMap['morning_checkin'].count : 0) >= 1,
        claimed: claimedTaskTypes.includes('morning_checkin'),
        category: 'daily'
      },
      {
        id: 'night_checkin',
        name: '晚安打卡',
        description: '结束美好的一天，和舍友们说晚安',
        target: 1,
        current: completedTaskMap['night_checkin'] ? completedTaskMap['night_checkin'].count : 0,
        rewardExp: 20,
        rewardPoints: 20,
        rewardType: 'starlight',
        icon: '🌙',
        completed: (completedTaskMap['night_checkin'] ? completedTaskMap['night_checkin'].count : 0) >= 1,
        claimed: claimedTaskTypes.includes('night_checkin'),
        category: 'daily'
      },
      {
        id: 'share_mood',
        name: '分享心情',
        description: '记录今天的心情，与舍友分享你的故事',
        target: 3,
        current: completedTaskMap['share_mood'] ? completedTaskMap['share_mood'].count : 0,
        rewardExp: 15,
        rewardPoints: 15,
        rewardType: 'starlight',
        icon: '💝',
        completed: (completedTaskMap['share_mood'] ? completedTaskMap['share_mood'].count : 0) >= 3,
        claimed: claimedTaskTypes.includes('share_mood'),
        category: 'daily'
      },
      {
        id: 'view_roommate_mood',
        name: '查看舍友心情',
        description: '关心舍友今天的心情如何',
        target: 5,
        current: completedTaskMap['view_roommate_mood'] ? completedTaskMap['view_roommate_mood'].count : 0,
        rewardExp: 5,
        rewardPoints: 5,
        rewardType: 'starlight',
        icon: '👀',
        completed: (completedTaskMap['view_roommate_mood'] ? completedTaskMap['view_roommate_mood'].count : 0) >= 5,
        claimed: claimedTaskTypes.includes('view_roommate_mood'),
        category: 'daily'
      },
      {
        id: 'like_roommate_post',
        name: '点赞舍友动态',
        description: '为舍友的精彩生活点赞',
        target: 10,
        current: completedTaskMap['like_roommate_post'] ? completedTaskMap['like_roommate_post'].count : 0,
        rewardExp: 3,
        rewardPoints: 3,
        rewardType: 'starlight',
        icon: '👍',
        completed: (completedTaskMap['like_roommate_post'] ? completedTaskMap['like_roommate_post'].count : 0) >= 10,
        claimed: claimedTaskTypes.includes('like_roommate_post'),
        category: 'daily'
      }
    ];
    
    // 每周挑战任务
    const weeklyChallenges = [
      {
        id: 'weekly_full_attendance',
        name: '全勤奖',
        description: '连续 7 天完成每日任务',
        target: 7,
        rewardExp: 100,
        rewardPoints: 100,
        rewardType: 'starlight',
        icon: '🏆',
        category: 'weekly'
      },
      {
        id: 'weekly_share_master',
        name: '分享达人',
        description: '本周分享 5 次心情',
        target: 5,
        rewardExp: 80,
        rewardPoints: 80,
        rewardType: 'starlight',
        icon: '✨',
        category: 'weekly'
      },
      {
        id: 'weekly_interaction_star',
        name: '互动之星',
        description: '本周获得 50 次点赞',
        target: 50,
        rewardExp: 150,
        rewardPoints: 150,
        rewardType: 'starlight',
        icon: '⭐',
        category: 'weekly'
      }
    ];
    
    // 获取每周任务进度
    for (const task of weeklyChallenges) {
      const progress = await getWeeklyProgress(OPENID, task.id, weekStart, weekEnd);
      task.current = progress;
      task.completed = progress >= task.target;
      task.claimed = claimedTaskTypes.includes(task.id);
    }
    
    // 宿舍集体任务
    const dormitoryTasks = [
      {
        id: 'dormitory_goodnight',
        name: '晚安宿舍',
        description: '宿舍 4 人全部完成晚安打卡',
        target: Math.min(4, dormitoryMembers.data.length),
        rewardExp: 50,
        rewardPoints: 50,
        rewardType: 'starlight',
        icon: '🏠',
        category: 'dormitory'
      },
      {
        id: 'dormitory_mood',
        name: '今日心情',
        description: '宿舍 4 人都分享今天的心情',
        target: Math.min(4, dormitoryMembers.data.length),
        rewardExp: 30,
        rewardPoints: 30,
        rewardType: 'starlight',
        icon: '💕',
        category: 'dormitory'
      },
      {
        id: 'dormitory_night_talk',
        name: '宿舍夜话',
        description: '宿舍成员间完成 10 条互动',
        target: 10,
        rewardExp: 40,
        rewardPoints: 40,
        rewardType: 'starlight',
        icon: '💬',
        category: 'dormitory'
      }
    ];
    
    // 获取宿舍任务进度
    for (const task of dormitoryTasks) {
      const progress = await getDormitoryTaskProgress(dormitoryMembers.data, task.id, todayStart, todayEnd, weekStart, weekEnd);
      task.current = progress;
      task.completed = progress >= task.target;
      task.claimed = claimedTaskTypes.includes(task.id);
    }
    
    return {
      success: true,
      data: {
        dailyTasks: dailyTasks,
        weeklyChallenges: weeklyChallenges,
        dormitoryTasks: dormitoryTasks,
        userPoints: {
          starlight: user.starlightPoints || 0,
          crystal: user.crystalDiamonds || 0
        }
      }
    };
    
  } catch (error) {
    console.error('获取每日任务失败:', error);
    return {
      success: false,
      message: '加载失败：' + error.message
    };
  }
};

// 获取每周任务进度
async function getWeeklyProgress(userId, taskType, weekStart, weekEnd) {
  try {
    if (taskType === 'weekly_full_attendance') {
      // 统计本周有签到记录的天数
      const checkInRecords = await db.collection('checkInRecords')
        .where({
          userId: userId,
          checkInDate: _.gte(weekStart).and(_.lt(weekEnd))
        })
        .get();
      
      // 去重统计天数
      const uniqueDays = new Set();
      checkInRecords.data.forEach(record => {
        const date = new Date(record.checkInDate);
        date.setHours(0, 0, 0, 0);
        uniqueDays.add(date.getTime());
      });
      
      return uniqueDays.size;
      
    } else if (taskType === 'weekly_share_master') {
      // 统计本周分享心情次数
      const shareRecords = await db.collection('taskRecords')
        .where({
          userId: userId,
          taskType: 'share_mood',
          completedAt: _.gte(weekStart).and(_.lt(weekEnd))
        })
        .get();
      
      return shareRecords.data.length;
      
    } else if (taskType === 'weekly_interaction_star') {
      // 统计本周获得的点赞数（简化：用点赞任务完成次数代替）
      const likeRecords = await db.collection('taskRecords')
        .where({
          userId: userId,
          taskType: 'like_roommate_post',
          completedAt: _.gte(weekStart).and(_.lt(weekEnd))
        })
        .get();
      
      return likeRecords.data.length * 10; // 每次点赞任务代表 10 次点赞
      
    }
  } catch (error) {
    console.error('获取每周进度失败:', error);
  }
  
  return 0;
}

// 获取宿舍任务进度
async function getDormitoryTaskProgress(members, taskType, todayStart, todayEnd, weekStart, weekEnd) {
  try {
    if (taskType === 'dormitory_goodnight') {
      // 统计今天完成晚安打卡的人数
      let count = 0;
      for (const member of members) {
        const records = await db.collection('taskRecords')
          .where({
            userId: member.userId,
            taskType: 'night_checkin',
            completedAt: _.gte(todayStart).and(_.lt(todayEnd))
          })
          .get();
        
        if (records.data.length > 0) {
          count++;
        }
      }
      return count;
      
    } else if (taskType === 'dormitory_mood') {
      // 统计今天分享心情的人数
      let count = 0;
      for (const member of members) {
        const records = await db.collection('taskRecords')
          .where({
            userId: member.userId,
            taskType: 'share_mood',
            completedAt: _.gte(todayStart).and(_.lt(todayEnd))
          })
          .get();
        
        if (records.data.length > 0) {
          count++;
        }
      }
      return count;
      
    } else if (taskType === 'dormitory_night_talk') {
      // 统计本周宿舍成员间的互动次数（简化：用留言板记录）
      // TODO: 需要实现留言板互动统计
      return 0;
    }
  } catch (error) {
    console.error('获取宿舍任务进度失败:', error);
  }
  
  return 0;
}
