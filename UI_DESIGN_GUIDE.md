# 瓜瓜陪伴 - UI/UX 设计规范

**版本**: 1.0
**更新日期**: 2026-03-24
**设计风格**: 女生喜爱的温暖可爱风格

---

## 一、设计理念

### 核心价值观
- **温暖**: 柔和的粉色系，传递温暖治愈感
- **可爱**: 圆润的边角，亲和的视觉语言
- **治愈**: 舒适的色彩搭配，减轻用户压力
- **统一**: 所有页面遵循相同的设计规范

---

## 二、颜色系统

### 2.1 主题色
```scss
$primary-color: #FF6B81;        // 温暖珊瑚粉 - 主色调
$primary-light: #FF8FA3;        // 樱花粉 - 浅粉色
$primary-lighter: #FFB6C1;      // 玫瑰石英粉 - 极浅粉
$primary-dark: #E65A6F;         // 深粉色
$primary-gradient: linear-gradient(135deg, #FF6B81 0%, #FF8FA3 100%);
```

### 2.2 辅助色（马卡龙色系）
```scss
$secondary-color: #FFE4E8;      // 浅粉背景
$accent-peach: #FFDAB9;         // 蜜桃色
$accent-lavender: #E6E6FA;      // 淡紫色
$accent-mint: #C1F0DC;          // 薄荷绿
$accent-lemon: #FFF5BA;         // 柠檬黄
$accent-sky: #B8E6F5;           // 天空蓝
```

### 2.3 功能色
```scss
$success-color: #76C893;        // 成功绿（柔和薄荷绿）
$warning-color: #FFB347;        // 警告橙（柔和橙）
$error-color: #FF8A8A;          // 错误红（柔和粉红包）
$info-color: #87CEEB;           // 信息蓝（天空蓝）
```

### 2.4 中性色
```scss
$text-primary: #3D3D3D;         // 主文字（深灰）
$text-secondary: #6B6B6B;       // 次要文字（中灰）
$text-muted: #9A9A9A;           // 弱化文字（浅灰）
$text-disabled: #C9C9C9;        // 禁用文字
$text-white: #FFFFFF;           // 白色文字
```

### 2.5 背景色
```scss
$bg-page: linear-gradient(180deg, #FFF5F6 0%, #FFE4E8 100%);  // 页面背景
$bg-primary: #FFFFFF;           // 主背景（纯白）
$bg-secondary: #F8F5F6;         // 次要背景（淡粉灰）
$bg-tertiary: #F0EDEE;          // 第三背景
```

### 2.6 边框色
```scss
$border-color: #E8E0E3;         // 边框（粉灰调）
$border-light: #F2EDEE;         // 浅边框
$border-divider: #EBE5E7;       // 分割线
```

---

## 三、排版系统

### 3.1 字体大小（rpx 单位）
| 变量名 | 值 | 用途 |
|--------|-----|------|
| $font-size-xs | 20rpx | 辅助文字/标签 |
| $font-size-sm | 24rpx | 次要文字/说明 |
| $font-size-md | 28rpx | 正文标准 |
| $font-size-lg | 32rpx | 重要文字 |
| $font-size-xl | 36rpx | 小标题 |
| $font-size-xxl | 40rpx | 大标题 |
| $font-size-title | 48rpx | 页面标题 |

### 3.2 字重
```scss
$font-weight-light: 300;
$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;
```

### 3.3 行高
```scss
$line-height-tight: 1.2;     // 标题/紧凑文字
$line-height-normal: 1.5;    // 标准正文
$line-height-relaxed: 1.75;  // 宽松排版
$line-height-loose: 2.0;     // 诗歌/特殊排版
```

---

## 四、间距系统

### 4.1 基础间距（8 的倍数）
| 变量名 | 值 | 用途 |
|--------|-----|------|
| $margin-xs / $padding-xs | 8rpx | 最小间距 |
| $margin-sm / $padding-sm | 16rpx | 小间距 |
| $margin-md / $padding-md | 24rpx | 中间距 |
| $margin-lg / $padding-lg | 32rpx | 大间距 |
| $margin-xl / $padding-xl | 48rpx | 超大间距 |
| $margin-xxl / $padding-xxl | 64rpx | 特大间距 |

### 4.2 组件间距
```scss
$gap-xs: 8rpx;       // 最小间距
$gap-sm: 12rpx;      // 小间距
$gap-md: 16rpx;      // 中间距
$gap-lg: 24rpx;      // 大间距
$gap-xl: 32rpx;      // 超大间距
```

### 4.3 页面级间距
```scss
$page-padding: 32rpx;       // 页面标准内边距
$page-margin: 24rpx;        // 页面标准外边距
$section-margin: 32rpx;     // 区块间距
$card-margin: 24rpx;        // 卡片间距
```

---

## 五、圆角系统

### 5.1 基础圆角
| 变量名 | 值 | 用途 |
|--------|-----|------|
| $radius-none | 0 | 无圆角 |
| $radius-xs | 8rpx | 最小圆角 |
| $radius-sm | 12rpx | 小圆角 |
| $radius-md | 16rpx | 中等圆角 |
| $radius-lg | 20rpx | 大圆角 |
| $radius-xl | 24rpx | 超大圆角 |
| $radius-xxl | 32rpx | 特大圆角 |
| $radius-full | 50% | 圆形 |

### 5.2 组件圆角
```scss
$btn-radius: 20rpx;         // 按钮圆角
$card-radius: 24rpx;        // 卡片圆角
$input-radius: 20rpx;       // 输入框圆角
$avatar-radius: 50%;        // 头像圆角
$badge-radius: 50%;         // 徽章圆角
```

---

## 六、阴影系统

### 6.1 基础阴影
```scss
$shadow-xs: 0 1rpx 4rpx rgba(0, 0, 0, 0.04);
$shadow-sm: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
$shadow-md: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
$shadow-lg: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
$shadow-xl: 0 12rpx 32rpx rgba(0, 0, 0, 0.16);
```

### 6.2 主题色阴影
```scss
$shadow-primary-xs: 0 2rpx 8rpx rgba(255, 107, 129, 0.1);
$shadow-primary-sm: 0 4rpx 12rpx rgba(255, 107, 129, 0.15);
$shadow-primary-md: 0 6rpx 16rpx rgba(255, 107, 129, 0.2);
$shadow-primary-lg: 0 8rpx 24rpx rgba(255, 107, 129, 0.25);
$shadow-primary-xl: 0 12rpx 32rpx rgba(255, 107, 129, 0.3);
```

---

## 七、动画系统

### 7.1 过渡时间
```scss
$transition-fast: 0.2s;
$transition-normal: 0.3s;
$transition-slow: 0.5s;
```

### 7.2 过渡函数
```scss
$ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
$ease-out: cubic-bezier(0, 0, 0.2, 1);
$ease-in: cubic-bezier(0.4, 0, 1, 1);
$bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### 7.3 关键帧动画
- `fadeIn` - 淡入
- `fadeOut` - 淡出
- `scaleIn` - 缩放进入
- `slideInUp` - 从下滑入
- `slideInDown` - 从上滑入
- `bounce` - 弹跳
- `pulse` - 脉冲
- `shake` - 摇晃

---

## 八、图标系统

### 8.1 图标风格
- **可爱**: 使用 emoji 和圆润的 Unicode 字符
- **简洁**: 一目了然，不复杂
- **统一**: 相同含义使用相同图标

### 8.2 图标分类

#### 功能性图标
| 类型 | 图标 | 变量名 |
|------|------|--------|
| 首页 | 🏠 | $icon-home |
| 返回 | ← | $icon-back |
| 关闭 | × | $icon-close |
| 设置 | ⚙️ | $icon-settings |
| 搜索 | 🔍 | $icon-search |
| 编辑 | ✏️ | $icon-edit |
| 删除 | 🗑️ | $icon-delete |
| 分享 | 📤 | $icon-share |

#### 状态图标
| 类型 | 图标 | 变量名 |
|------|------|--------|
| 成功 | ✅ | $icon-success |
| 警告 | ⚠️ | $icon-warning |
| 错误 | ❌ | $icon-error |
| 信息 | ℹ️ | $icon-info |
| 收藏 | ⭐ | $icon-favorite |

#### 业务图标
| 类型 | 图标 | 变量名 |
|------|------|--------|
| 用户 | 👤 | $icon-user |
| 任务 | 📋 | $icon-task |
| 积分 | 💎 | $icon-points |
| 星光值 | 🌟 | $icon-starlight |
| 优惠券 | 🎫 | $icon-coupon |
| 礼物 | 🎁 | $icon-gift |
| 宿舍 | 🏠 | $icon-dormitory |
| 聊天 | 💬 | $icon-chat |

#### 情感图标
| 类型 | 图标 | 变量名 |
|------|------|--------|
| 开心 | 😊 | $mood-happy |
| 兴奋 | 🤩 | $mood-excited |
| 平静 | 😌 | $mood-calm |
| 难过 | 😢 | $mood-sad |
| 生气 | 😠 | $mood-angry |
| 疲惫 | 😫 | $mood-tired |

### 8.3 图标尺寸
| 尺寸 | 值 | 用途 |
|------|-----|------|
| xs | 32rpx | 小图标（标签、徽章） |
| sm | 40rpx | 较小图标（列表项） |
| md | 48rpx | 标准图标（按钮、菜单） |
| lg | 56rpx | 较大图标（卡片） |
| xl | 80rpx | 大图标（空状态、头部） |
| xxl | 100rpx | 特大图标（空状态） |
| xxxl | 120rpx | 超大图标（页面装饰） |

---

## 九、组件规范

### 8.1 卡片
```scss
.card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}
```

### 8.2 按钮
```scss
.btn-primary {
  background: linear-gradient(135deg, #FF6B81 0%, #FF8FA3 100%);
  color: #FFFFFF;
  border-radius: 20rpx;
  padding: 16rpx 48rpx;
  font-size: 28rpx;
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 129, 0.15);
}
```

### 8.3 输入框
```scss
.input {
  width: 100%;
  padding: 16rpx;
  background: #F8F5F6;
  border-radius: 20rpx;
  font-size: 28rpx;
}
```

### 8.4 头像
```scss
.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: #FFE4E8;
}
```

---

## 十、页面背景规范

所有页面使用统一的淡粉色渐变背景：
```scss
background: linear-gradient(180deg, #FFF5F6 0%, #FFE4E8 100%);
```

特殊情况可使用主题相关渐变：
- 积分相关：橙黄色系渐变
- 放松助眠：绿色系渐变
- 哄睡故事：紫色系渐变
- 心情统计：蓝色系渐变

---

## 十一、业务主题规范

### 11.1 积分主题（橙黄色系）
```scss
$gradient-points: linear-gradient(180deg, #FFF3E0 0%, #FFE0B2 100%);
$gradient-points-header: linear-gradient(135deg, #FFB74D 0%, #FFCC80 100%);
$points-text-primary: #E65100;
$points-text-secondary: #F57C00;
$shadow-points-*: 橙色系阴影;
$orange-transparent-*: 橙色透明变体;
```

### 11.2 放松助眠主题（绿色系）
```scss
$gradient-relax: linear-gradient(180deg, #E8F5E9 0%, #C8E6C9 100%);
$relax-text-primary: #2E7D32;
$relax-text-secondary: #66BB6A;
$shadow-relax-*: 绿色系阴影;
$green-transparent-*: 绿色透明变体;
```

### 11.3 哄睡故事主题（紫色系）
```scss
$gradient-stories: linear-gradient(180deg, #E8E4F5 0%, #D5C7F0 100%);
$stories-text-primary: #5C4B8A;
$stories-text-secondary: #7D6FA8;
$shadow-stories-*: 紫色系阴影;
$purple-transparent-*: 紫色透明变体;
```

### 11.4 心情统计主题（蓝色系）
```scss
$gradient-mood: linear-gradient(180deg, #E3F2FD 0%, #BBDEFB 100%);
$mood-text-primary: #1565C0;
$mood-text-secondary: #42A5F5;
$mood-gradient-btn: linear-gradient(135deg, #2196F3 0%, #64B5F6 100%);
$shadow-mood-*: 蓝色系阴影;
$blue-transparent-*: 蓝色透明变体;
```

### 11.5 优惠券主题（红色系）
```scss
$gradient-coupon: linear-gradient(135deg, #EF5350 0%, #E57373 100%);
$shadow-coupon-*: 红色系阴影;
$red-transparent-*: 红色透明变体;
```

---

## 十二、透明色变体

### 12.1 主主题透明变体（粉色系）
```scss
$primary-transparent-10: rgba(255, 107, 129, 0.1);
$primary-transparent-15: rgba(255, 107, 129, 0.15);
$primary-transparent-20: rgba(255, 107, 129, 0.2);
$primary-transparent-30: rgba(255, 107, 129, 0.3);
```

### 12.2 业务主题透明变体
```scss
// 蓝色系（心情主题）
$blue-transparent-10/15/20/30
$blue-gradient-transparent

// 绿色系（放松主题）
$green-transparent-10/20
$green-gradient-transparent

// 橙色系（积分主题）
$orange-transparent-10/20
$orange-gradient-transparent

// 紫色系（故事主题）
$purple-transparent-10/20
$purple-gradient-transparent

// 红色系（优惠券主题）
$red-transparent-30
$coupon-divider-gradient

// 金色（奖励）
$gold-transparent-10

// 通用黑色
$black-transparent-10
```

---

## 十三、使用指南

### 13.1 在 WXSS 文件中引用
```scss
@import '../../styles/variables/_index.scss';

// 使用变量
.container {
  background: $bg-page;
  padding: $page-padding;
}

.btn {
  background: $primary-gradient;
  color: $text-white;
}
```

### 13.2 通用样式类
全局样式类可直接在 wxml 中使用：
```html
<view class="flex-center mb-lg">
  <text class="text-primary font-bold">标题</text>
</view>
```

### 13.3 业务主题类
```html
<!-- 背景类 -->
<view class="bg-points">积分页面</view>
<view class="bg-relax">放松页面</view>
<view class="bg-stories">故事页面</view>
<view class="bg-mood">心情页面</view>
<view class="bg-coupon">优惠券页面</view>

<!-- 卡片类 -->
<view class="card-primary">主题卡片</view>
<view class="card-points">积分卡片</view>
<view class="card-relax">放松卡片</view>
<view class="card-stories">故事卡片</view>
<view class="card-mood">心情卡片</view>

<!-- 阴影类 -->
<view class="shadow-sm">小阴影</view>
<view class="shadow-md">中等阴影</view>
<view class="shadow-primary">主题阴影</view>

<!-- 动画类 -->
<view class="fade-in">淡入</view>
<view class="scale-in">缩放进入</view>
<view class="bounce">弹跳</view>
```

---

## 十四、检查清单

在添加新页面或组件时，请确认：
- [ ] 使用统一的色彩变量
- [ ] 使用统一的间距变量
- [ ] 使用统一的圆角变量
- [ ] 使用统一的字体大小
- [ ] 背景色符合规范
- [ ] 阴影效果一致
- [ ] 动画过渡统一
- [ ] 优先使用变量而非硬编码值
- [ ] 业务页面使用对应的主题变量

---

## 十五、文件结构

```
styles/
├── variables/
│   ├── _index.scss        # 统一入口
│   ├── color.scss         # 颜色变量
│   ├── spacing.scss       # 间距变量
│   ├── typography.scss    # 排版变量
│   ├── radius.scss        # 圆角变量
│   ├── animation.scss     # 动画变量
│   ├── shadow.scss        # 阴影变量
│   ├── icon.scss          # 图标变量
│   └── common.scss        # 通用样式类
```

---

## 十六、变量总计

| 类别 | 变量数量 | 文件 |
|------|---------|------|
| 颜色 | 100+ | color.scss |
| 间距 | 40+ | spacing.scss |
| 排版 | 40+ | typography.scss |
| 圆角 | 10+ | radius.scss |
| 动画 | 20+ | animation.scss |
| 阴影 | 40+ | shadow.scss |
| 图标 | 60+ | icon.scss |
| 通用类 | 80+ | common.scss |
| **总计** | **400+** | - |

---

## 十七、Ralph Loop 统一规范完成报告

**完成时间**: 2026-03-24
**迭代次数**: 10 轮
**变更文件数**: 26 个

### 创建的文件 (10 个)
1. `styles/variables/_index.scss` - 统一入口
2. `styles/variables/color.scss` - 颜色系统
3. `styles/variables/spacing.scss` - 间距系统
4. `styles/variables/typography.scss` - 排版系统
5. `styles/variables/radius.scss` - 圆角系统
6. `styles/variables/animation.scss` - 动画系统
7. `styles/variables/shadow.scss` - 阴影系统
8. `styles/variables/icon.scss` - 图标系统
9. `styles/variables/common.scss` - 通用样式类
10. `UI_DESIGN_GUIDE.md` - 设计指南文档

### 更新的文件 (16 个)
1. `app.wxss` - 全局样式
2. `pages/index/Index.wxss` - 首页
3. `pages/chat/Chat.wxss` - 聊天页
4. `pages/profile/Profile.wxss` - 个人页
5. `pages/decoration/Shop.wxss` - 装饰商城
6. `pages/task/Index.wxss` - 任务页
7. `pages/dormitory/Index.wxss` - 宿舍页
8. `pages/dormitory/Create.wxss` - 创建宿舍
9. `pages/points/Shop.wxss` - 积分商城
10. `pages/points/My.wxss` - 我的积分
11. `pages/coupon/My.wxss` - 我的优惠券
12. `pages/relax/Index.wxss` - 放松助眠
13. `pages/stories/Stories.wxss` - 哄睡故事
14. `pages/read/Index.wxss` - 读给你听
15. `pages/summary/Summary.wxss` - 今日小确幸
16. `pages/mood/Statistics.wxss` - 心情统计

### 修复的硬编码值 (50+ 处)
- 颜色值：#FF6B81 → $primary-color
- 渐变：linear-gradient(...) → $primary-gradient
- rgba 值：rgba(0,0,0,0.1) → $black-transparent-10
- 阴影：0 4rpx 16rpx → $shadow-md
- 间距：8rpx/16rpx/24rpx → $gap-xs/sm/md
- 字体大小：32rpx/40rpx → $icon-size-base/large
- 动画：ease-in-out → $ease-in-out

### 新增变量统计
| 类别 | 新增变量 |
|------|---------|
| 业务主题渐变 | 10+ |
| 业务主题文字色 | 10+ |
| 透明色变体 | 20+ |
| 业务主题阴影 | 20+ |
| 尺寸变量 | 20+ |
| 通用样式类 | 60+ |

### 统一规范达成
✅ 所有页面使用统一的样式变量入口
✅ 无硬编码颜色值（业务主题特殊颜色除外）
✅ 无硬编码间距值（特殊尺寸除外）
✅ 无硬编码阴影值
✅ 动画和过渡使用统一变量
✅ 图标使用统一规范
✅ 目录结构保持不变
✅ 所有变量有清晰的注释

---

**遵守本规范，确保用户体验的一致性和高质量！**
