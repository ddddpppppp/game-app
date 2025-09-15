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
  // 移除静态导出配置，改为服务端渲染
  // output: 'export',
  // distDir: 'dist',
  // trailingSlash: true,
}

export default nextConfig
