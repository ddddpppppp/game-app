"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Eye, EyeOff, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ChangePasswordPageProps {
  onBack: () => void
}

export function ChangePasswordPage({ onBack }: ChangePasswordPageProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const { toast } = useToast()

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8
    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    return { minLength, hasUpper, hasLower, hasNumber, hasSpecial }
  }

  const passwordStrength = validatePassword(newPassword)
  const isPasswordValid = Object.values(passwordStrength).every(Boolean)

  const handleSave = () => {
    if (!currentPassword) {
      toast({
        title: "Current Password Required",
        description: "Please enter your current password.",
        variant: "destructive",
      })
      return
    }

    if (!isPasswordValid) {
      toast({
        title: "Invalid Password",
        description: "Please ensure your new password meets all requirements.",
        variant: "destructive",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "New password and confirmation don't match.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Password Updated",
      description: "Your password has been successfully updated.",
    })
    setTimeout(() => onBack(), 1500)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold">Change Password</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Update Your Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="current-password" className="mb-2 block">
                Current Password
              </Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showPasswords.current ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => togglePasswordVisibility("current")}
                >
                  {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="new-password" className="mb-2 block">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPasswords.new ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => togglePasswordVisibility("new")}
                >
                  {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Password Requirements */}
            {newPassword && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Password Requirements:</p>
                <div className="space-y-1 text-xs">
                  {Object.entries({
                    "At least 8 characters": passwordStrength.minLength,
                    "One uppercase letter": passwordStrength.hasUpper,
                    "One lowercase letter": passwordStrength.hasLower,
                    "One number": passwordStrength.hasNumber,
                    "One special character": passwordStrength.hasSpecial,
                  }).map(([requirement, met]) => (
                    <div
                      key={requirement}
                      className={`flex items-center gap-2 ${met ? "text-green-600" : "text-red-600"}`}
                    >
                      <div className={`w-2 h-2 rounded-full ${met ? "bg-green-600" : "bg-red-600"}`} />
                      {requirement}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="mb-2 block">
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => togglePasswordVisibility("confirm")}
                >
                  {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button onClick={handleSave} className="w-full" size="lg">
              Update Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
