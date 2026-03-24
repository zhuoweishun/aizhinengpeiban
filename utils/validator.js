/**
 * 数据验证工具类
 * @description 提供用户输入数据的有效性验证功能
 * @author 玄枢
 * @date 2026-03-16
 */

/**
 * 验证宿舍名称
 * @param {string} name - 宿舍名称
 * @returns {object} 验证结果 {valid: boolean, message: string}
 */
const validateDormitoryName = (name) => {
  if (!name || name.trim() === '') {
    return {
      valid: false,
      message: '请输入宿舍名称'
    };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    return {
      valid: false,
      message: '宿舍名称至少 2 个字符'
    };
  }

  if (trimmedName.length > 20) {
    return {
      valid: false,
      message: '宿舍名称不能超过 20 个字符'
    };
  }

  // 检查是否包含特殊字符（只允许中文、字母、数字）
  const reg = /^[\u4e00-\u9fa5a-zA-Z0-9]+$/;
  if (!reg.test(trimmedName)) {
    return {
      valid: false,
      message: '宿舍名称只能包含中文、字母和数字'
    };
  }

  return {
    valid: true,
    message: '验证通过'
  };
};

/**
 * 验证宿舍简介
 * @param {string} introduction - 宿舍简介
 * @returns {object} 验证结果
 */
const validateIntroduction = (introduction) => {
  if (!introduction || introduction.trim() === '') {
    return {
      valid: true, // 简介可以为空
      message: ''
    };
  }

  const trimmedIntro = introduction.trim();

  if (trimmedIntro.length > 200) {
    return {
      valid: false,
      message: '宿舍简介不能超过 200 个字符'
    };
  }

  return {
    valid: true,
    message: '验证通过'
  };
};

/**
 * 验证邀请码
 * @param {string} code - 邀请码
 * @returns {object} 验证结果
 */
const validateInviteCode = (code) => {
  if (!code || code.trim() === '') {
    return {
      valid: false,
      message: '请输入邀请码'
    };
  }

  const trimmedCode = code.trim();

  // 邀请码格式：6 位字母数字组合
  const reg = /^[a-zA-Z0-9]{6}$/;
  if (!reg.test(trimmedCode)) {
    return {
      valid: false,
      message: '邀请码格式不正确（6 位字母数字）'
    };
  }

  return {
    valid: true,
    message: '验证通过'
  };
};

/**
 * 验证舍友称呼
 * @param {string} title - 称呼
 * @returns {object} 验证结果
 */
const validateMemberTitle = (title) => {
  if (!title || title.trim() === '') {
    return {
      valid: false,
      message: '请输入称呼'
    };
  }

  const trimmedTitle = title.trim();

  if (trimmedTitle.length < 2) {
    return {
      valid: false,
      message: '称呼至少 2 个字符'
    };
  }

  if (trimmedTitle.length > 10) {
    return {
      valid: false,
      message: '称呼不能超过 10 个字符'
    };
  }

  return {
    valid: true,
    message: '验证通过'
  };
};

/**
 * 验证手机号（可选功能）
 * @param {string} phone - 手机号
 * @returns {object} 验证结果
 */
const validatePhone = (phone) => {
  if (!phone || phone.trim() === '') {
    return {
      valid: false,
      message: '请输入手机号'
    };
  }

  const reg = /^1[3-9]\d{9}$/;
  if (!reg.test(phone)) {
    return {
      valid: false,
      message: '手机号格式不正确'
    };
  }

  return {
    valid: true,
    message: '验证通过'
  };
};

/**
 * 获取优惠券描述
 * @param {string} couponType - 优惠券类型
 * @returns {string} 优惠券描述
 */
function getCouponDescription(couponType) {
  const descriptions = {
    'coupon_50_200': '满¥200 减¥50 优惠券',
    'coupon_60_400': '满¥400 减¥60 优惠券',
    'coupon_80_500': '满¥500 减¥80 优惠券',
    'coupon_100_600': '满¥600 减¥100 优惠券',
    'coupon_150_1000': '满¥1000 减¥150 优惠券',
    'coupon_300_2000': '满¥2000 减¥300 优惠券',
    // 星光值折扣券
    'starlight_discount_90': '水晶 9 折折扣券（无门槛）',
    'starlight_discount_85': '水晶 85 折折扣券（无门槛）',
    'starlight_discount_80': '水晶 8 折折扣券（无门槛）',
    'starlight_discount_75': '水晶 75 折折扣券（无门槛）',
    'starlight_discount_70': '水晶 7 折折扣券（无门槛）',
    // 晶钻抵扣券
    'crystal_cash_10': '晶钻抵扣券（抵¥10）',
    'crystal_cash_50': '晶钻抵扣券（抵¥50）',
    'crystal_cash_120': '晶钻抵扣券（抵¥120）',
    'crystal_cash_250': '晶钻抵扣券（抵¥250）',
    'crystal_cash_700': '晶钻抵扣券（抵¥700）'
  };
  return descriptions[couponType] || '优惠券';
}

module.exports = {
  validateDormitoryName,
  validateIntroduction,
  validateInviteCode,
  validateMemberTitle,
  validatePhone,
  getCouponDescription
};
