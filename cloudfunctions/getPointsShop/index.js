// 云函数：获取积分商城数据
// 功能：获取用户当前积分、优惠券配置列表、计算本月已兑换数量、标注是否可兑换
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { OPENID } = wxContext;
  
  try {
    // 1. 获取用户信息（积分余额）
    const userResult = await db.collection('members').where({
      userId: OPENID
    }).get();
    
    let userPoints = {
      starlight: 0,
      crystal: 0
    };
    
    if (userResult.data.length > 0) {
      const user = userResult.data[0];
      userPoints = {
        starlight: user.starlightPoints || 0,
        crystal: user.crystalDiamonds || 0
      };
    }
    
    // 2. 获取优惠券配置列表
    const coupons = getCouponsConfig();
    
    // 3. 计算本月已兑换数量
    const now = Date.now();
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const redeemedCountResult = await db.collection('couponRedemptions').where({
      userId: OPENID,
      createdAt: _.gte(startOfMonth.getTime()),
      status: _.in(['unused', 'used'])
    }).count();
    
    const redeemedThisMonth = redeemedCountResult.total;
    const monthlyLimit = 2;
    const canRedeemMore = redeemedThisMonth < monthlyLimit;
    
    // 4. 标注是否可兑换（积分足够 + 未达上限）
    const couponsWithAvailability = coupons.map(coupon => {
      const canAfford = userPoints[coupon.pointsType] >= coupon.pointsCost;
      const canRedeem = canAfford && canRedeemMore;
      
      return {
        couponType: coupon.couponType,
        couponValue: coupon.couponValue,
        minPurchase: coupon.minPurchase,
        pointsCost: coupon.pointsCost,
        pointsType: coupon.pointsType,
        discount: coupon.discount,
        description: coupon.description,
        canRedeem: canRedeem,
        canAfford: canAfford,
        reason: !canRedeem ? (!canAfford ? '积分不足' : (!canRedeemMore ? '已达本月兑换上限' : '')) : ''
      };
    });
    
    // 返回结果（严格按文档格式）
    return {
      success: true,
      data: {
        userPoints: userPoints,
        coupons: couponsWithAvailability,
        monthlyLimit: monthlyLimit,
        redeemedThisMonth: redeemedThisMonth,
        canRedeemMore: canRedeemMore
      }
    };
    
  } catch (error) {
    console.error('获取积分商城数据失败:', error);
    return {
      success: false,
      message: '加载失败：' + error.message
    };
  }
};

/**
 * 获取优惠券配置列表
 * 根据官方文档：瓜瓜陪伴小程序 - 女生宿舍商业化方案.docx
 * 
 * 星光值折扣档位（个人活跃）：
 * - 3000 分 → 9 折（约 15 天）
 * - 5000 分 → 85 折（约 25 天）
 * - 8000 分 → 8 折（约 40 天）
 * - 10000 分 → 75 折（约 50 天）
 * - 15000 分 → 7 折（约 75 天）
 * 
 * 晶钻抵扣规则（集体任务）：
 * - 100 晶钻 → 抵¥10（约 7 天）
 * - 500 晶钻 → 抵¥50（约 33 天）
 * - 1000 晶钻 → 抵¥120（额外赠送 17%）
 * - 2000 晶钻 → 抵¥250（额外赠送 25%）
 * - 5000 晶钻 → 抵¥700（额外赠送 40%）
 */
function getCouponsConfig() {
  return [
    // 星光值折扣券
    {
      couponType: 'starlight_discount_90',
      couponValue: 90,
      minPurchase: 0,
      discount: '9 折',
      pointsCost: 3000,
      pointsType: 'starlight',
      description: '水晶 9 折折扣券（无门槛）',
      estimateDays: '约 15 天'
    },
    {
      couponType: 'starlight_discount_85',
      couponValue: 85,
      minPurchase: 0,
      discount: '85 折',
      pointsCost: 5000,
      pointsType: 'starlight',
      description: '水晶 85 折折扣券（无门槛）',
      estimateDays: '约 25 天'
    },
    {
      couponType: 'starlight_discount_80',
      couponValue: 80,
      minPurchase: 0,
      discount: '8 折',
      pointsCost: 8000,
      pointsType: 'starlight',
      description: '水晶 8 折折扣券（无门槛）',
      estimateDays: '约 40 天'
    },
    {
      couponType: 'starlight_discount_75',
      couponValue: 75,
      minPurchase: 0,
      discount: '75 折',
      pointsCost: 10000,
      pointsType: 'starlight',
      description: '水晶 75 折折扣券（无门槛）',
      estimateDays: '约 50 天'
    },
    {
      couponType: 'starlight_discount_70',
      couponValue: 70,
      minPurchase: 0,
      discount: '7 折',
      pointsCost: 15000,
      pointsType: 'starlight',
      description: '水晶 7 折折扣券（无门槛）',
      estimateDays: '约 75 天'
    },
    // 晶钻抵扣券
    {
      couponType: 'crystal_cash_10',
      couponValue: 10,
      minPurchase: 0,
      discount: '抵¥10',
      pointsCost: 100,
      pointsType: 'crystal',
      description: '晶钻抵扣券（抵¥10）',
      estimateDays: '约 7 天',
      bonusRate: 0
    },
    {
      couponType: 'crystal_cash_50',
      couponValue: 50,
      minPurchase: 0,
      discount: '抵¥50',
      pointsCost: 500,
      pointsType: 'crystal',
      description: '晶钻抵扣券（抵¥50）',
      estimateDays: '约 33 天',
      bonusRate: 0
    },
    {
      couponType: 'crystal_cash_120',
      couponValue: 120,
      minPurchase: 0,
      discount: '抵¥120',
      pointsCost: 1000,
      pointsType: 'crystal',
      description: '晶钻抵扣券（抵¥120，额外赠送 17%）',
      estimateDays: '约 67 天',
      bonusRate: 17
    },
    {
      couponType: 'crystal_cash_250',
      couponValue: 250,
      minPurchase: 0,
      discount: '抵¥250',
      pointsCost: 2000,
      pointsType: 'crystal',
      description: '晶钻抵扣券（抵¥250，额外赠送 25%）',
      estimateDays: '约 133 天',
      bonusRate: 25
    },
    {
      couponType: 'crystal_cash_700',
      couponValue: 700,
      minPurchase: 0,
      discount: '抵¥700',
      pointsCost: 5000,
      pointsType: 'crystal',
      description: '晶钻抵扣券（抵¥700，额外赠送 40%）',
      estimateDays: '约 333 天',
      bonusRate: 40
    }
  ];
}
