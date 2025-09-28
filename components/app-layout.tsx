"use client"

import type React from "react"
import { BottomNav } from "@/components/bottom-nav"
import { useAuth } from "@/components/auth-provider"
import { usePathname } from "next/navigation"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()

  const isAuthPage = pathname === "/login" || pathname === "/register"
  const isPublicPageWithNav = pathname === "/home" || pathname.startsWith("/games/")

  return (
    <div className="min-h-screen bg-background transition-all duration-300 ease-in-out">
      {/* PWA安装提示 - 全局显示，但在登录/注册页面可能不需要 */}
      {!isAuthPage && <PWAInstallPrompt />}
      
      {/* 登录/注册页面：简单布局 */}
      {isAuthPage && children}
      
      {/* 已登录或公共页面：带导航栏的布局 */}
      {!isAuthPage && (isAuthenticated || isPublicPageWithNav) && (
        <>
          <main className="pb-20 transition-all duration-200 ease-in-out">
            {children}
          </main>
          <BottomNav />
        </>
      )}
      
      {/* 其他页面：普通布局 */}
      {!isAuthPage && !(isAuthenticated || isPublicPageWithNav) && children}
    </div>
  )
}
