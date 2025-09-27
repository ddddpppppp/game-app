#!/usr/bin/env node

// 加载环境变量
require('dotenv').config({ path: '.env.local' });

const OSS = require('ali-oss');
const path = require('path');
const fs = require('fs');
const { globSync } = require('glob');
const mime = require('mime-types');
const zlib = require('zlib');
const crypto = require('crypto');
const { minimatch } = require('minimatch');

// 加载配置
const config = require('../oss.config.js');

// 颜色输出函数
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 创建 OSS 客户端
const client = new OSS({
  region: config.region,
  accessKeyId: config.accessKeyId,
  accessKeySecret: config.accessKeySecret,
  bucket: config.bucket,
});

// 检查配置
function validateConfig() {
  const required = ['region', 'accessKeyId', 'accessKeySecret', 'bucket'];
  const missing = required.filter(key => !config[key]);
  
  if (missing.length > 0) {
    log('red', `❌ 缺少必要配置: ${missing.join(', ')}`);
    log('yellow', '请在环境变量中设置以下值:');
    log('yellow', '- OSS_ACCESS_KEY_ID');
    log('yellow', '- OSS_ACCESS_KEY_SECRET');
    log('yellow', '- OSS_BUCKET');
    log('yellow', '- OSS_CDN_DOMAIN (可选)');
    process.exit(1);
  }
  
  log('green', '✅ OSS 配置验证通过');
}

// 计算文件 hash
function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hash = crypto.createHash('md5');
  hash.update(fileBuffer);
  return hash.digest('hex');
}

// 检查文件是否需要上传（基于 hash 比较）
async function shouldUpload(localPath, ossKey) {
  try {
    const localHash = getFileHash(localPath);
    const result = await client.head(ossKey);
    const remoteHash = result.meta && result.meta['content-md5'];
    return localHash !== remoteHash;
  } catch (error) {
    // 文件不存在，需要上传
    return true;
  }
}

// 压缩文件
function gzipFile(filePath) {
  const ext = path.extname(filePath);
  if (config.gzip.enabled && config.gzip.extensions.includes(ext)) {
    const content = fs.readFileSync(filePath);
    return zlib.gzipSync(content);
  }
  return null;
}

// 上传单个文件
async function uploadFile(localPath, ossKey) {
  try {
    const stat = fs.statSync(localPath);
    const ext = path.extname(localPath);
    
    // 准备上传参数
    const options = {
      meta: {
        'content-md5': getFileHash(localPath)
      },
      headers: {}
    };

    // 设置 Content-Type
    const contentType = mime.lookup(localPath) || 'application/octet-stream';
    options.headers['Content-Type'] = contentType;

    // 设置缓存控制
    if (config.uploadOptions.staticExtensions.includes(ext)) {
      options.headers['Cache-Control'] = config.uploadOptions.cacheControl;
    }

    // 检查是否需要压缩
    const gzippedContent = gzipFile(localPath);
    if (gzippedContent) {
      options.headers['Content-Encoding'] = 'gzip';
      await client.put(ossKey, gzippedContent, options);
      log('cyan', `📦 [压缩上传] ${ossKey} (${(stat.size / 1024).toFixed(2)}KB → ${(gzippedContent.length / 1024).toFixed(2)}KB)`);
    } else {
      await client.put(ossKey, localPath, options);
      log('blue', `📁 [上传] ${ossKey} (${(stat.size / 1024).toFixed(2)}KB)`);
    }

  } catch (error) {
    log('red', `❌ 上传失败 ${ossKey}: ${error.message}`);
    throw error;
  }
}

// 获取需要上传的文件列表
function getUploadFiles(distDir) {
  const files = [];
  
  // 获取所有文件
  const allFiles = globSync('**/*', { 
    cwd: distDir, 
    nodir: true,
    dot: false 
  });

  for (const file of allFiles) {
    const fullPath = path.join(distDir, file);
    const ext = path.extname(file);
    
    // 检查是否应该排除
    let shouldExclude = false;
    for (const pattern of config.excludePatterns) {
      if (minimatch(file, pattern)) {
        shouldExclude = true;
        break;
      }
    }

    if (!shouldExclude) {
      // 如果只上传静态资源，检查文件类型
      if (!config.uploadOptions.uploadAll) {
        if (config.uploadOptions.staticExtensions.includes(ext) || file.startsWith('_next/')) {
          files.push(file);
        }
      } else {
        files.push(file);
      }
    }
  }

  return files;
}

// 主上传函数
async function uploadToOSS() {
  try {
    log('yellow', '🚀 开始上传到阿里云 OSS...');
    
    // 验证配置
    validateConfig();
    
    const distDir = path.join(__dirname, '../dist');
    
    if (!fs.existsSync(distDir)) {
      log('red', '❌ dist 目录不存在，请先运行 npm run build');
      process.exit(1);
    }

    // 获取要上传的文件列表
    const files = getUploadFiles(distDir);
    
    if (files.length === 0) {
      log('yellow', '⚠️  没有找到需要上传的文件');
      return;
    }

    log('blue', `📋 找到 ${files.length} 个文件需要处理`);

    let uploadCount = 0;
    let skipCount = 0;

    // 并发上传文件
    const uploadPromises = files.map(async (file) => {
      const localPath = path.join(distDir, file);
      const ossKey = file; // 保持原有目录结构
      
      // 检查是否需要上传
      if (await shouldUpload(localPath, ossKey)) {
        await uploadFile(localPath, ossKey);
        uploadCount++;
      } else {
        log('yellow', `⏭️  [跳过] ${ossKey} (文件未变化)`);
        skipCount++;
      }
    });

    // 限制并发数
    const batchSize = 10;
    for (let i = 0; i < uploadPromises.length; i += batchSize) {
      const batch = uploadPromises.slice(i, i + batchSize);
      await Promise.all(batch);
    }

    log('green', `\n✅ 上传完成!`);
    log('green', `📊 统计信息:`);
    log('green', `   - 新上传: ${uploadCount} 个文件`);
    log('green', `   - 跳过: ${skipCount} 个文件`);
    log('green', `   - 总计: ${files.length} 个文件`);
    
    if (config.cdnDomain) {
      log('cyan', `🌐 CDN 域名: ${config.cdnDomain}`);
      log('cyan', `📱 静态资源访问地址: ${config.cdnDomain}/_next/static/...`);
    }

  } catch (error) {
    log('red', `❌ 上传过程中出现错误: ${error.message}`);
    process.exit(1);
  }
}

// 如果是直接运行脚本
if (require.main === module) {
  uploadToOSS();
}

module.exports = { uploadToOSS };
