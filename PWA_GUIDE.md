# PWA 功能指南

## 📱 什么是 PWA？

Progressive Web App (PWA) 是一种可以像原生应用一样体验的网页应用。用户可以将其安装到设备主屏幕，享受离线访问、推送通知等功能。

## 🚀 已实现的功能

### ✅ 1. PWA 基础配置

- **Manifest 文件**: `/public/manifest.json`
- **Service Worker**: 自动生成，支持缓存策略
- **PWA 图标**: 完整的图标集合 (72x72 到 512x512)

### ✅ 2. 自动安装提示

- **智能提示**: 用户进入应用时自动显示安装提示
- **跨平台支持**:
  - Android/Windows: 标准 PWA 安装流程
  - iOS: 显示 Safari"添加到主屏幕"指引
- **用户体验优化**:
  - 提示只显示一次（使用 localStorage 记录）
  - 已安装用户不显示提示
  - 可关闭提示

### ✅ 3. 缓存策略

- **静态资源缓存**: JS/CSS 文件缓存 24 小时
- **图片缓存**: 图片资源缓存策略
- **字体缓存**: Google Fonts 缓存 365 天
- **离线支持**: 核心功能可离线访问

## 📋 文件结构

```
app/
├── public/
│   ├── manifest.json           # PWA配置文件
│   └── icons/                  # PWA图标集合
│       ├── icon-72x72.png
│       ├── icon-192x192.png
│       ├── icon-512x512.png
│       └── ...
├── components/
│   └── pwa-install-prompt.tsx  # 安装提示组件
├── scripts/
│   ├── generate-pwa-icons.js   # 图标生成脚本
│   └── convert-icons-to-png.js # SVG转PNG脚本
└── next.config.mjs             # Next.js + PWA配置
```

## 🛠️ 使用命令

### 生成 PWA 图标

```bash
# 生成SVG图标
npm run icons:generate

# 转换为PNG格式
npm run icons:convert

# 一键生成所有图标
npm run icons:build
```

### 开发和部署

```bash
# 开发模式（PWA功能禁用）
npm run dev

# 生产构建（PWA功能启用）
npm run build

# 完整部署（包含PWA图标生成）
npm run deploy:full
```

## 🎨 自定义图标

### 方法 1: 替换 SVG 模板

编辑 `scripts/generate-pwa-icons.js` 中的 `createSVG()` 函数，修改图标设计。

### 方法 2: 使用设计工具

1. 在 Figma/Sketch 中设计 512x512px 的图标
2. 导出为 PNG 格式
3. 使用在线工具生成其他尺寸：
   - [PWA Builder](https://www.pwabuilder.com/imageGenerator)
   - [PWA Icon Generator](https://tools.crawlink.com/tools/pwa-icon-generator)

### 方法 3: 使用 Sharp 脚本

```javascript
// 在scripts/目录下创建自定义转换脚本
const sharp = require("sharp");

sharp("your-logo.svg")
  .resize(512, 512)
  .png()
  .toFile("public/icons/icon-512x512.png");
```

## 📱 安装体验

### Android/Chrome

1. 访问网站
2. 看到安装提示横幅
3. 点击"安装"按钮
4. 应用自动添加到主屏幕

### iOS/Safari

1. 访问网站
2. 看到安装提示
3. 点击分享按钮 (⬆️)
4. 选择"添加到主屏幕"

### 桌面浏览器

1. 地址栏会显示安装图标
2. 点击安装图标
3. 应用安装到系统

## ⚙️ PWA 配置详解

### Manifest 配置 (`public/manifest.json`)

- **name**: 应用完整名称
- **short_name**: 主屏幕显示名称
- **start_url**: 启动页面
- **display**: 显示模式 (`standalone` 类似原生应用)
- **theme_color**: 主题色
- **background_color**: 启动页背景色

### Service Worker 配置 (`next.config.mjs`)

- **dest**: SW 文件生成目录
- **register**: 自动注册 SW
- **skipWaiting**: 立即激活新 SW
- **runtimeCaching**: 缓存策略配置

## 🔧 故障排除

### 常见问题

1. **图标不显示**

   - 检查 `public/icons/` 目录是否有 PNG 文件
   - 运行 `npm run icons:build` 重新生成

2. **安装提示不出现**

   - 清除 localStorage: `localStorage.removeItem('pwa-install-prompt-shown')`
   - 确保使用 HTTPS 访问
   - 检查浏览器开发者工具 Console

3. **PWA 功能不工作**
   - 确保生产环境构建: `NODE_ENV=production`
   - 检查 Service Worker 注册状态
   - 验证 manifest.json 格式

### 测试 PWA 功能

1. **Chrome DevTools**

   - F12 → Application → Manifest
   - 检查 PWA 安装条件

2. **Lighthouse PWA 审核**
   - F12 → Lighthouse → Progressive Web App
   - 获得 PWA 得分和改进建议

## 📈 后续增强

### 可添加的功能

- [ ] 推送通知
- [ ] 后台同步
- [ ] 更新提示
- [ ] 分享 API
- [ ] 文件系统访问

### 性能优化

- [ ] 预缓存关键路由
- [ ] 图片懒加载优化
- [ ] 网络策略优化
- [ ] 离线页面优化

## 📚 相关资源

- [PWA 官方文档](https://web.dev/progressive-web-apps/)
- [Next.js PWA 插件](https://github.com/shadowwalker/next-pwa)
- [PWA 最佳实践](https://web.dev/pwa-checklist/)
- [Workbox 缓存策略](https://developers.google.com/web/tools/workbox/guides/route-requests)
