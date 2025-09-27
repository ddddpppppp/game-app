// OSS 配置文件
// 请根据你的阿里云 OSS 信息进行配置

module.exports = {
  // OSS 基本配置
  region: process.env.OSS_REGION || 'oss-cn-hangzhou', // 你的 OSS region，如 'oss-cn-hangzhou'
  accessKeyId: process.env.OSS_ACCESS_KEY_ID, // 从环境变量读取 AccessKey ID
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET, // 从环境变量读取 AccessKey Secret
  bucket: process.env.OSS_BUCKET, // 从环境变量读取 Bucket 名称
  
  // CDN 域名配置
  cdnDomain: process.env.OSS_CDN_DOMAIN, // 你的 CDN 域名，如 'https://cdn.yourdomain.com'
  
  // 上传配置
  uploadOptions: {
    // 设置缓存时间（秒）
    cacheControl: 'max-age=31536000', // 1年缓存
    // 支持的静态资源文件类型
    staticExtensions: ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'],
    // 静态资源目录前缀
    prefix: '_next/static/',
    // 是否上传所有文件（包括HTML）
    uploadAll: false,
  },
  
  // 文件过滤配置
  excludePatterns: [
    '**/*.html', // 排除 HTML 文件（除非 uploadAll 为 true）
    '**/404.html',
    '**/index.html',
    '**/*.txt',
    '**/*.json',
  ],
  
  // 压缩设置
  gzip: {
    enabled: true,
    extensions: ['.js', '.css', '.html', '.json', '.svg'],
  }
};
