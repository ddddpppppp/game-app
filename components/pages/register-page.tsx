"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/lib/services/auth"
import { useAuth } from "@/components/auth-provider"
import { getDeviceCode } from "@/lib/utils/device"

interface RegisterPageProps {
  onSwitchToLogin: () => void
}

export function RegisterPage({ onSwitchToLogin }: RegisterPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const { toast } = useToast()
  const { login } = useAuth()

  const handleSendCode = async () => {
    // 邮箱验证
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    
    try {
      // 调用发送验证码 API
      await authService.sendVerificationCode({ email, type: 'register' })
      
      setIsCodeSent(true)
      
      // 开始倒计时
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      toast({
        title: "Code Sent",
        description: "Verification code sent to your email",
      })
    } catch (error: any) {
      console.error('Send code error:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to send verification code",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // 基础验证
    if (!email || !password || !confirmPassword || !name || !verificationCode) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // 密码匹配验证
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // 密码长度验证
    if (password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      // 获取设备码
      const deviceCode = getDeviceCode()
      
      // 调用注册 API
      const response = await authService.register({
        email,
        password,
        name,
        code: verificationCode,
        device_code: deviceCode,
      })
      
      // 注册成功后自动登录
      login(response.token, response.user)
      
      toast({
        title: "Success",
        description: "Account created successfully!",
      })
    } catch (error: any) {
      console.error('Register error:', error)
      toast({
        title: "Error",
        description: error.message || "Registration failed",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-foreground">Create Account</CardTitle>
          <CardDescription className="text-muted-foreground">Join our gaming platform today</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground block mb-2">
                Email
              </label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleSendCode}
                  disabled={isLoading || countdown > 0}
                  variant="outline"
                  className="whitespace-nowrap bg-transparent"
                >
                  {countdown > 0 ? `${countdown}s` : isCodeSent ? "Resend" : "Send Code"}
                </Button>
              </div>
            </div>

            {isCodeSent && (
              <div className="space-y-2">
                <label htmlFor="code" className="text-sm font-medium text-foreground block mb-2">
                  Verification Code
                </label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter verification code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full"
                />
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground block mb-2">
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground block mb-2">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password (min 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground block mb-2">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading || !isCodeSent}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <button onClick={onSwitchToLogin} className="text-primary hover:underline font-medium">
                Sign in
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
