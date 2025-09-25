"use client"

import { Home, Wallet, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter, usePathname } from "next/navigation"
import { useCallback, useMemo, startTransition } from "react"

export function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()

  const tabs = useMemo(
    () => [
      { id: "home", label: "Home", icon: Home, path: "/home" },
      { id: "wallet", label: "Wallet", icon: Wallet, path: "/wallet" },
      { id: "profile", label: "Profile", icon: User, path: "/profile" },
    ],
    [],
  )

  const activeTab = useMemo(() => {
    if (pathname.startsWith("/home") || pathname.startsWith("/games")) return "home"
    if (pathname.startsWith("/wallet")) return "wallet"
    if (pathname.startsWith("/profile")) return "profile"
    return "home"
  }, [pathname])

  const handleNavigation = useCallback(
    (path: string) => {
      if (pathname !== path && !pathname.startsWith(path)) {
        startTransition(() => {
          router.push(path)
        })
      }
    },
    [router, pathname],
  )

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
                "flex flex-row items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-150",
                isActive ? "text-white bg-accent" : "text-card-foreground hover:text-accent hover:bg-accent/10",
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
