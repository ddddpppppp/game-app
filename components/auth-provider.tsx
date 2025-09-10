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
          
          // 重定向到登录页（除非已经在登录或注册页）
          if (pathname !== "/login" && pathname !== "/register" && pathname !== "/forgot-password") {
            router.replace("/login")
          }
          return
        }

        // 有 token，首先使用本地存储的用户信息
        if (storedUser) {
          try {
            const userInfo = JSON.parse(storedUser)
            setIsAuthenticated(true)
            setUser(userInfo)
          } catch (error) {
            console.error('Failed to parse stored user info:', error)
            // 如果解析失败，清除存储
            localStorage.removeItem('user')
          }
        }
        
        // 只有在应用初始化时才调用API验证token
        if (!hasInitialized) {
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
            if (pathname !== "/login" && pathname !== "/register" && pathname !== "/forgot-password") {
              router.replace("/login")
              toast({
                title: "Session Expired",
                description: "Please log in again",
                variant: "destructive",
              })
            }
          }
          setHasInitialized(true)
        }
        
        setIsLoading(false)
        
        // 处理路由重定向
        if (token && (isAuthenticated || !hasInitialized)) {
          // 如果在登录或注册页，重定向到首页
          if (pathname === "/login" || pathname === "/register" || pathname === "/" || pathname === "/forgot-password") {
            router.replace("/home")
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setIsAuthenticated(false)
        setUser(null)
        
        if (pathname !== "/login" && pathname !== "/register" && pathname !== "/forgot-password") {
          router.replace("/login")
        }
        setIsLoading(false)
        setHasInitialized(true)
      }
    }

    checkAuth()
  }, [pathname, router, toast, hasInitialized])

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setIsAuthenticated(true)
    setUser(userData)
    router.replace("/home")
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
    
    setIsAuthenticated(false)
    setUser(null)
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

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
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
