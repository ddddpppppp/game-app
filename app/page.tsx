"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"

export default function RootPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const pathname = usePathname()
  useEffect(() => {
    if (!isLoading) {
      // console.log(pathname)
      // if (isAuthenticated || pathname === "/") {
      //   router.replace("/home")
      // } else {
      //   router.replace("/login")
      // }
    }
  }, [router, isAuthenticated, isLoading])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
