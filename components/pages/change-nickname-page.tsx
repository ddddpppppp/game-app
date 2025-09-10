"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useProfile } from "@/hooks/use-profile"

interface ChangeNicknamePageProps {
  onBack: () => void
}

export function ChangeNicknamePage({ onBack }: ChangeNicknamePageProps) {
  const { user, updateUserInfo, isUpdating } = useProfile()
  const [nickname, setNickname] = useState(user?.name || "")
  const { toast } = useToast()

  const handleSave = async () => {
    if (!nickname.trim()) {
      toast({
        title: "Invalid Nickname",
        description: "Nickname cannot be empty.",
        variant: "destructive",
      })
      return
    }

    if (nickname.length < 3) {
      toast({
        title: "Invalid Nickname",
        description: "Nickname must be at least 3 characters long.",
        variant: "destructive",
      })
      return
    }

    if (nickname === user?.name) {
      toast({
        title: "No Changes",
        description: "The nickname is the same as your current one.",
        variant: "destructive",
      })
      return
    }

    try {
      await updateUserInfo({ nickname })
      setTimeout(() => onBack(), 1500)
    } catch (error) {
      // 错误已在useProfile中处理
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold">Change Nickname</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Update Your Nickname</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nickname" className="mb-2 block">
                Nickname
              </Label>
              <Input
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Enter your nickname"
                maxLength={20}
                disabled={isUpdating}
              />
              <p className="text-xs text-muted-foreground mt-1">{nickname.length}/20 characters</p>
            </div>

            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Nickname Guidelines</p>
                <ul className="mt-1 space-y-1 text-xs">
                  <li>• Must be 3-20 characters long</li>
                  <li>• Can contain letters, numbers, and underscores</li>
                  <li>• Must be unique across the platform</li>
                </ul>
              </div>
            </div>

            <Button onClick={handleSave} className="w-full" size="lg" disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
