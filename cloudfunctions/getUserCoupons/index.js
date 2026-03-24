// 云函数：获取用户优惠券
// 功能：获取用户所有优惠券，支持状态筛选，自动检测过期状态，计算剩余天数
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

// 获取优惠券描述 - 使用工具函数
const { getCouponDescription } = require('../../utils/validator');

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { OPENID } = wxContext;
  
  try {
    const { status } = event; // 可选：筛选状态 'unused' | 'used' | 'expired' | undefined（全部）
    
    // 1. 获取用户优惠券列表
    let query = {
      userId: OPENID
    };
    
    // 如果指定了状态且不是 'all'，则按状态筛选
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const couponsResult = await db.collection('couponRedemptions')
      .where(query)
      .orderBy('createdAt', 'desc')
      .get();
    
    const now = Date.now();
    
    // 2. 处理优惠券数据，自动检测过期状态
    const allCoupons = couponsResult.data.map(coupon => {
      const isExpired = coupon.expireAt < now;
      const actualStatus = isExpired ? 'expired' : coupon.status;
      const daysLeft = isExpired ? 0 : Math.ceil((coupon.expireAt - now) / (24 * 60 * 60 * 1000));
      
      return {
        id: coupon._id,
        couponType: coupon.couponType,
        couponValue: coupon.couponValue,
        minPurchase: coupon.minPurchase,
        discount: calculateDiscount(coupon.couponValue, coupon.minPurchase),
        status: actualStatus,
        pointsType: coupon.pointsType,
        pointsCost: coupon.pointsCost,
        expireAt: coupon.expireAt,
        usedAt: coupon.usedAt || null,
        createdAt: coupon.createdAt,
        daysLeft: daysLeft,
        description: getCouponDescription(coupon.couponType)
      };
    });
    
    // 3. 如果有未使用的优惠券已过期，异步更新状态
    const expiredUnusedCoupons = couponsResult.data.filter(
      c => c.status === 'unused' && c.expireAt < now
    );
    
    if (expiredUnusedCoupons.length > 0) {
      const expiredIds = expiredUnusedCoupons.map(c => c._id);
      db.collection('couponRedemptions').where({
        _id: _.in(expiredIds)
      }).update({
        data: {
          status: 'expired'
        }
      }).then(() => {
        console.log('已更新 ' + expiredUnusedCoupons.length + ' '张优惠券状态为已过期');
      }).catch(err => {
        console.error('更新过期优惠券状态失败:', err);
      });
    }
    
    // 4. 分类统计
    const unusedCoupons = allCoupons.filter(c => c.status === 'unused');
    const usedCoupons = allCoupons.filter(c => c.status === 'used');
    const expiredCoupons = allCoupons.filter(c => c.status === 'expired');
    
    // 5. 返回结果（严格按文档格式）
    return {
      success: true,
      data: {
        all: allCoupons,
        unused: unusedCoupons,
        used: usedCoupons,
        expired: expiredCoupons,
        stats: {
          total: allCoupons.length,
          unused: unusedCoupons.length,
          used: usedCoupons.length,
          expired: expiredCoupons.length
        }
      }
    };
    
  } catch (error) {
    console.error('获取用户优惠券失败:', error);
    return {
      success: false,
      message: '加载失败：' + error.message
    };
  }
};

/**
 * 计算折扣
 */
function calculateDiscount(value, minPurchase) {
  if (!minPurchase || minPurchase === 0) return 'N/A';
  const discount = (minPurchase - value) / minPurchase;
  return Math.round(discount * 100) + ' 折';
}
