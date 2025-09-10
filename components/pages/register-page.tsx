"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface RegisterPageProps {
  onRegister: () => void
  onSwitchToLogin: () => void
}

export function RegisterPage({ onRegister, onSwitchToLogin }: RegisterPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSendCode = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    // Simulate sending verification code
    setTimeout(() => {
      setIsCodeSent(true)
      setIsLoading(false)
      toast({
        title: "Code Sent",
        description: "Verification code sent to your email",
      })
    }, 1000)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Mock registration validation
    if (!email || !password || !confirmPassword || !verificationCode) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Success",
        description: "Account created successfully!",
      })
      onRegister()
      setIsLoading(false)
    }, 1000)
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
                  disabled={isLoading || isCodeSent}
                  variant="outline"
                  className="whitespace-nowrap bg-transparent"
                >
                  {isCodeSent ? "Sent" : "Send Code"}
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
              <label htmlFor="password" className="text-sm font-medium text-foreground block mb-2">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
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
