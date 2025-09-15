"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
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

  useEffect(() => {
    const checkAuth = async () => {
      if (hasInitialized) {
        setIsLoading(false)
        return
      }

      try {
        // 检查本地存储中的 token
        const token = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')
        
        if (!token) {
          // 没有 token，未登录状态
          setIsAuthenticated(false)
          setUser(null)
          setIsLoading(false)
          setHasInitialized(true)
          
          // 只在非公开页面时重定向到登录页
          const publicPages = ["/login", "/register", "/forgot-password"]
          if (!publicPages.includes(pathname)) {
            router.replace("/login")
          }
          return
        }

        // 有 token，使用本地存储的用户信息快速加载
        if (storedUser) {
          try {
            const userInfo = JSON.parse(storedUser)
            setIsAuthenticated(true)
            setUser(userInfo)
            setIsLoading(false)
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
          
          // 重定向到登录页
          const publicPages = ["/login", "/register", "/forgot-password"]
          if (!publicPages.includes(pathname)) {
            router.replace("/login")
            toast({
              title: "Session Expired",
              description: "Please log in again",
              variant: "destructive",
            })
          }
        }
        
        setHasInitialized(true)
        setIsLoading(false)
        
        // 处理登录后的路由重定向
        if (token && isAuthenticated) {
          const authPages = ["/login", "/register", "/", "/forgot-password"]
          if (authPages.includes(pathname)) {
            router.replace("/home")
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setIsAuthenticated(false)
        setUser(null)
        setIsLoading(false)
        setHasInitialized(true)
        
        const publicPages = ["/login", "/register", "/forgot-password"]
        if (!publicPages.includes(pathname)) {
          router.replace("/login")
        }
      }
    }

    checkAuth()
  }, [pathname, router, toast, hasInitialized, isAuthenticated])

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setIsAuthenticated(true)
    setUser(userData)
    router.replace("/home")
  }

  const resetUser = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = async () => {
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
  }

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
