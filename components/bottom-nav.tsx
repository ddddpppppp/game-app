"use client"

import { Home, Wallet, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter, usePathname } from "next/navigation"
import { useCallback } from "react"

export function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()

  const tabs = [
    { id: "home", label: "Home", icon: Home, path: "/home" },
    { id: "wallet", label: "Wallet", icon: Wallet, path: "/wallet" },
    { id: "profile", label: "Profile", icon: User, path: "/profile" },
  ]

  const getActiveTab = () => {
    if (pathname.startsWith("/home")) return "home"
    if (pathname.startsWith("/wallet")) return "wallet"
    if (pathname.startsWith("/profile")) return "profile"
    if (pathname.startsWith("/games")) return "home" // Games belong to home section
    return "home"
  }

  const activeTab = getActiveTab()

  // 优化路由导航，使用 useCallback 避免重复渲染
  const handleNavigation = useCallback((path: string) => {
    if (pathname !== path) {
      router.push(path)
    }
  }, [router, pathname])

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => handleNavigation(tab.path)}
              className={cn(
                "flex flex-row items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ease-in-out",
                isActive 
                  ? "text-white bg-accent scale-105" 
                  : "text-card-foreground hover:text-accent hover:bg-accent/10 active:scale-95",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
