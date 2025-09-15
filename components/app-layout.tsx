"use client"

import type React from "react"
import { BottomNav } from "@/components/bottom-nav"
import { useAuth } from "@/components/auth-provider"
import { usePathname } from "next/navigation"

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()

  const isAuthPage = pathname === "/login" || pathname === "/register"

  if (!isAuthenticated || isAuthPage) {
    return (
      <div className="min-h-screen bg-background transition-all duration-300 ease-in-out">
        {children}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background transition-all duration-300 ease-in-out">
      <main className="pb-20 transition-all duration-200 ease-in-out">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
