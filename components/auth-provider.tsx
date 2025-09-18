"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { authService, type User } from "@/lib/services/auth"
import { useToast } from "@/hooks/use-toast"

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  login: (token: string, user: User) => void
  logout: () => void
  resetUser: (user: User) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasInitialized, setHasInitialized] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  // 缓存公开页面路径，避免每次重新计算
  const publicPages = ["/login", "/register", "/forgot-password", "/home", "/games/canada28", "/"]
  const authPages = ["/login", "/register", "/forgot-password"]

  // 优化路由重定向，使用useCallback缓存函数
  const redirectToLogin = useCallback(() => {
    if (!publicPages.includes(pathname)) {
      router.replace("/login")
    }
  }, [pathname, router])

  const redirectToHome = useCallback(() => {
    if (authPages.includes(pathname) || pathname === "/") {
      router.replace("/home")
    }
  }, [pathname, router])

  useEffect(() => {

    const token = localStorage.getItem('token')
    if (!token) {
      // 没有 token，未登录状态
      setIsAuthenticated(false)
      setUser(null)
      setIsLoading(false)
      setHasInitialized(true)
      // 根路径重定向到首页，其他非公开页面重定向到登录页
      if (pathname === "/") {
        router.replace("/home")
      } else if (!publicPages.includes(pathname)) {
        redirectToLogin()
      }
      return
    }
    // 避免重复初始化
    if (hasInitialized) {
      return
    }

    const checkAuth = async () => {
      try {
        // 检查本地存储中的 token
        const storedUser = localStorage.getItem('user')
        

        // 有 token，使用本地存储的用户信息快速加载
        if (storedUser) {
          try {
            const userInfo = JSON.parse(storedUser)
            setIsAuthenticated(true)
            setUser(userInfo)
            setIsLoading(false)
            setHasInitialized(true)
            redirectToHome()
          } catch (error) {
            console.error('Failed to parse stored user info:', error)
            localStorage.removeItem('user')
          }
        }
        
        // 在后台验证token有效性（不阻塞UI）
        try {
          const response = await authService.getUserInfo()
          setIsAuthenticated(true)
          setUser(response.user)
          
          // 更新本地存储的用户信息
          localStorage.setItem('user', JSON.stringify(response.user))
        } catch (error) {
          // token 无效或过期
          console.error('Token validation failed:', error)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setIsAuthenticated(false)
          setUser(null)
          
          // 只在非公开页面显示错误提示
          if (!publicPages.includes(pathname)) {
            redirectToLogin()
            toast({
              title: "Session Expired",
              description: "Please log in again",
              variant: "destructive",
            })
          }
        }
        
        setHasInitialized(true)
        setIsLoading(false)
      } catch (error) {
        console.error('Auth initialization error:', error)
        setIsAuthenticated(false)
        setUser(null)
        setIsLoading(false)
        setHasInitialized(true)
        // 根路径重定向到首页，其他非公开页面重定向到登录页
        if (pathname === "/") {
          router.replace("/home")
        } else if (!publicPages.includes(pathname)) {
          redirectToLogin()
        }
      }
    }

    checkAuth()
  }, [redirectToLogin, redirectToHome, toast, hasInitialized, pathname])

  const login = useCallback((token: string, userData: User) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setIsAuthenticated(true)
    setUser(userData)
    router.replace("/home")
  }, [router])

  const resetUser = useCallback((userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
    
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUser(null)
    router.replace("/login")
  }, [router])

  // 简化加载状态显示
  if (isLoading && !hasInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading, resetUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
