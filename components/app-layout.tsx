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
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20">{children}</main>
      <BottomNav />
    </div>
  )
}
