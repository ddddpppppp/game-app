import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 365 days
        }
      }
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-static',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 365 days
        }
      }
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-image-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    {
      urlPattern: /\.(?:js|css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-js-css-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    }
  ]
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 静态导出配置
  output: 'export',
  distDir: 'dist',
  trailingSlash: true,
  
  // 静态导出优化配置
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons'],
  },
  
  // 避免静态导出时的hydration问题
  reactStrictMode: false,
  
  // 静态导出时跳过API路由
  generateBuildId: () => 'static-build',
  
  // 确保静态资源正确处理
  assetPrefix: process.env.NODE_ENV === 'production' && process.env.OSS_CDN_DOMAIN ? process.env.OSS_CDN_DOMAIN : '',
  images: { 
    loader: 'custom', 
    loaderFile: './lib/image/loader.ts',
  },
  // 处理动态导入和客户端兼容性
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 客户端构建配置
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
}

export default withPWA(nextConfig)
