const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');
const logoPath = path.join(__dirname, '../public/logo.png');

// 确保icons目录存在
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

async function generatePWAIconsFromLogo() {
  console.log('🎨 从logo.png生成PWA图标...');

  // 检查logo.png是否存在
  if (!fs.existsSync(logoPath)) {
    console.error('❌ 错误: logo.png文件不存在!');
    process.exit(1);
  }

  try {
    for (const size of iconSizes) {
      const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
      
      await sharp(logoPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 26, g: 44, b: 91, alpha: 1 } // 深蓝色背景 #1a2c5b
        })
        .png({ quality: 90, compressionLevel: 9 })
        .toFile(outputPath);
      
      console.log(`✅ 已生成: icon-${size}x${size}.png`);
    }

    // 创建一个带圆角的maskable版本 (推荐用于Android)
    for (const size of [192, 512]) {
      const maskablePath = path.join(iconsDir, `icon-${size}x${size}-maskable.png`);
      
      // 创建圆角遮罩
      const roundedCorners = Buffer.from(
        `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <mask id="rounded">
              <rect width="${size}" height="${size}" fill="white" rx="${size * 0.1}" ry="${size * 0.1}"/>
            </mask>
          </defs>
          <rect width="${size}" height="${size}" fill="#1a2c5b" mask="url(#rounded)"/>
        </svg>`
      );

      await sharp(logoPath)
        .resize(Math.round(size * 0.8), Math.round(size * 0.8), { fit: 'contain' })
        .extend({
          top: Math.round(size * 0.1),
          bottom: Math.round(size * 0.1),
          left: Math.round(size * 0.1),
          right: Math.round(size * 0.1),
          background: { r: 26, g: 44, b: 91, alpha: 1 }
        })
        .composite([{ input: roundedCorners, blend: 'dest-in' }])
        .png({ quality: 90, compressionLevel: 9 })
        .toFile(maskablePath);
      
      console.log(`✅ 已生成: icon-${size}x${size}-maskable.png`);
    }

    console.log('🎉 PWA图标生成完成!');
    console.log('📝 基于logo.png生成的高质量图标已准备就绪');

  } catch (error) {
    console.error('❌ 生成图标时出错:', error.message);
    process.exit(1);
  }
}

generatePWAIconsFromLogo();
