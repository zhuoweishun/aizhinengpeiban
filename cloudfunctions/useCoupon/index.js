// 云函数：使用优惠券
// 功能：验证优惠券、检查归属、检查状态、检查过期、更新状态、记录使用时间
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 获取优惠券描述 - 使用工具函数
const { getCouponDescription } = require('../../utils/validator');

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { OPENID } = wxContext;
  
  try {
    const { couponId, orderId, orderAmount } = event;
    
    // 1. 验证优惠券存在
    if (!couponId) {
      return {
        success: false,
        message: '请选择要使用的优惠券'
      };
    }
    
    const couponResult = await db.collection('couponRedemptions').doc(couponId).get();
    
    if (!couponResult.data) {
      return {
        success: false,
        message: '优惠券不存在'
      };
    }
    
    const coupon = couponResult.data;
    
    // 2. 检查优惠券归属
    if (coupon.userId !== OPENID) {
      return {
        success: false,
        message: '优惠券不属于您'
      };
    }
    
    // 3. 检查优惠券状态
    if (coupon.status !== 'unused') {
      const statusText = coupon.status === 'used' ? '已使用' : '已过期';
      return {
        success: false,
        message: '优惠券' + statusText + '，无法再次使用'
      };
    }
    
    // 4. 检查是否过期
    const now = Date.now();
    if (coupon.expireAt < now) {
      // 更新状态为过期
      await db.collection('couponRedemptions').doc(couponId).update({
        data: {
          status: 'expired'
        }
      });
      
      return {
        success: false,
        message: '优惠券已过期（有效期 30 天）'
      };
    }
    
    // 5. 检查订单金额是否满足门槛（如果提供了订单信息）
    if (orderAmount !== undefined && orderAmount < coupon.minPurchase) {
      return {
        success: false,
        message: '订单金额未达到优惠券使用门槛（满¥' + coupon.minPurchase + '可用，当前¥' + orderAmount + '）'
      };
    }
    
    // 6. 更新状态为 used，记录使用时间
    await db.collection('couponRedemptions').doc(couponId).update({
      data: {
        status: 'used',
        usedAt: now,
        orderId: orderId || null
      }
    });
    
    // 7. 记录积分流水（可选）
    try {
      await db.collection('pointsFlow').add({
        data: {
          userId: OPENID,
          dormitoryId: coupon.dormitoryId,
          type: 'use_coupon',
          pointsType: 'coupon',
          amount: coupon.couponValue,
          balance: 0,
          description: '使用' + getCouponDescription(coupon.couponType) + '，立减¥' + coupon.couponValue,
          couponId: couponId,
          orderId: orderId || null,
          createdAt: now
        }
      });
    } catch (flowError) {
      // pointsFlow 集合可能不存在，忽略错误
      console.log('⚠️  pointsFlow 集合不存在，跳过流水记录');
    }
    
    // 8. 返回结果
    return {
      success: true,
      message: '优惠券使用成功！立减¥' + coupon.couponValue,
      data: {
        couponId: couponId,
        couponValue: coupon.couponValue,
        minPurchase: coupon.minPurchase,
        usedAt: now,
        discountAmount: coupon.couponValue,
        orderId: orderId || null
      }
    };
    
  } catch (error) {
    console.error('使用优惠券失败:', error);
    return {
      success: false,
      message: '使用失败：' + error.message
    };
  }
};
