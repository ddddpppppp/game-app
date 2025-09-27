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

export default nextConfig
