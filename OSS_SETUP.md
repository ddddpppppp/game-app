# 阿里云 OSS 静态资源配置指南

本文档将指导你如何配置阿里云 OSS 来托管 Next.js 项目的静态资源。

## 🎯 功能特性

- ✅ 自动上传静态资源到阿里云 OSS
- ✅ 支持 CDN 加速配置
- ✅ 智能文件对比，只上传变更文件
- ✅ 自动压缩（Gzip）支持
- ✅ 灵活的文件过滤配置
- ✅ 集成到现有部署流程

## 📋 前置条件

1. 阿里云账号
2. 已创建的 OSS Bucket
3. AccessKey ID 和 AccessKey Secret

## 🚀 快速开始

### 1. 安装依赖

```bash
cd /home/bieber/www/game/app
npm install
```

### 2. 配置环境变量

复制环境变量模板：

```bash
cp env.example .env.local
```

编辑 `.env.local` 文件，填入你的 OSS 配置：

```env
# 阿里云 OSS 配置
OSS_ACCESS_KEY_ID=your_access_key_id
OSS_ACCESS_KEY_SECRET=your_access_key_secret
OSS_BUCKET=your_bucket_name
OSS_CDN_DOMAIN=https://cdn.yourdomain.com  # 可选
OSS_REGION=oss-cn-hangzhou
```

### 3. 配置 OSS Bucket

在阿里云 OSS 控制台：

1. **创建 Bucket**：

   - 地域选择就近地区
   - 存储类型选择"标准存储"
   - 读写权限设置为"公共读"

2. **配置跨域规则**（如果需要）：

   ```json
   {
     "allowedOrigins": ["*"],
     "allowedMethods": ["GET", "HEAD"],
     "allowedHeaders": ["*"],
     "exposeHeaders": ["ETag"],
     "maxAgeSeconds": 3600
   }
   ```

3. **配置静态网站托管**（可选）：
   - 开启静态网站托管
   - 设置默认首页为 `index.html`

### 4. 配置 CDN 加速（推荐）

1. 在阿里云 CDN 控制台添加加速域名
2. 源站类型选择"OSS 域名"
3. 源站地址选择你的 OSS Bucket
4. 配置缓存规则：
   - `*.js, *.css, *.png, *.jpg` 等静态资源缓存 1 年
   - `*.html` 缓存 1 小时或不缓存

## 🛠️ 使用方法

### 单独上传到 OSS

```bash
npm run upload:oss
```

### 构建并上传

```bash
npm run build:oss
```

### 完整部署（构建 + OSS + 服务器）

```bash
npm run deploy:full
```

### 使用原有部署脚本

```bash
./deploy.sh
```

## ⚙️ 高级配置

### 自定义 OSS 配置

编辑 `oss.config.js` 文件：

```javascript
module.exports = {
  // 基本配置
  region: "oss-cn-hangzhou",
  bucket: process.env.OSS_BUCKET,

  // 上传选项
  uploadOptions: {
    cacheControl: "max-age=31536000", // 缓存时间
    staticExtensions: [".js", ".css", ".png", ".jpg"], // 静态资源类型
    uploadAll: false, // 是否上传所有文件
  },

  // 排除文件
  excludePatterns: [
    "**/*.html", // 排除 HTML 文件
    "**/*.txt",
    "**/*.json",
  ],

  // 压缩配置
  gzip: {
    enabled: true,
    extensions: [".js", ".css", ".html", ".json", ".svg"],
  },
};
```

### Next.js 配置

项目已自动配置了 `assetPrefix`，当设置了 `OSS_CDN_DOMAIN` 环境变量时，静态资源会自动使用 CDN 域名。

## 📁 文件结构

```
app/
├── oss.config.js          # OSS 配置文件
├── env.example           # 环境变量模板
├── scripts/
│   └── upload-to-oss.js  # OSS 上传脚本
├── next.config.mjs       # Next.js 配置（已更新）
├── deploy.sh            # 部署脚本（已更新）
└── package.json         # 已添加新的 npm scripts
```

## 🔧 故障排除

### 1. 上传失败

- 检查 AccessKey 权限
- 确认 Bucket 名称正确
- 检查网络连接

### 2. CDN 未生效

- 确认 CDN 域名配置正确
- 检查 CNAME 解析
- 清除 CDN 缓存

### 3. 静态资源 404

- 检查 `assetPrefix` 配置
- 确认文件已正确上传到 OSS
- 检查 Bucket 权限设置

## 📊 监控和优化

### 查看上传日志

上传脚本会显示详细的上传信息：

- 新上传文件数量
- 跳过的文件数量
- 压缩比例
- CDN 域名信息

### 性能优化建议

1. 启用 CDN 加速
2. 配置合适的缓存策略
3. 启用 Gzip 压缩
4. 使用 WebP 图片格式
5. 定期清理无用文件

## 🔒 安全建议

1. **AccessKey 安全**：

   - 使用 RAM 子账号
   - 授予最小必要权限
   - 定期轮换 AccessKey

2. **Bucket 安全**：

   - 设置合适的访问权限
   - 启用访问日志
   - 配置防盗链

3. **CDN 安全**：
   - 配置 Referer 防盗链
   - 启用 HTTPS
   - 设置访问控制

## 📞 支持

如有问题，请检查：

1. 阿里云 OSS 官方文档
2. Next.js 静态导出文档
3. 项目的 GitHub Issues

---

配置完成后，你的静态资源将自动上传到 OSS 并通过 CDN 加速访问，大幅提升网站加载速度！
