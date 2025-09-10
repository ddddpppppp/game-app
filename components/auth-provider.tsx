"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  isAuthenticated: boolean
  login: () => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem("isAuthenticated")
      const isAuth = authStatus === "true"
      setIsAuthenticated(isAuth)
      setIsLoading(false)

      // if (!isAuth && pathname !== "/login" && pathname !== "/register") {
      //   router.replace("/login")
      // } else if (isAuth && (pathname === "/login" || pathname === "/register" || pathname === "/")) {
      //   router.replace("/home")
      // }
    }

    checkAuth()
  }, [pathname, router])

  const login = () => {
    setIsAuthenticated(true)
    localStorage.setItem("isAuthenticated", "true")
    router.replace("/home")
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("isAuthenticated")
    router.replace("/login")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
