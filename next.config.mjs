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
  distDir: 'dist', // 改变输出目录名称
  trailingSlash: true,
}

export default nextConfig
