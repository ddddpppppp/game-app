"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Camera, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useProfile } from "@/hooks/use-profile"

interface ChangeAvatarPageProps {
  onBack: () => void
}

const avatarOptions = [
  "/gaming-avatar-1.png",
  "/gaming-avatar-2.png",
  "/gaming-avatar-3.png",
  "/gaming-avatar-four.png",
  "/gaming-avatar-five.png",
  "/gaming-avatar-6.png",
]

export function ChangeAvatarPage({ onBack }: ChangeAvatarPageProps) {
  const { user, updateUserInfo, uploadFile, isUpdating, isUploading } = useProfile()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedAvatar, setSelectedAvatar] = useState<string>(user?.avatar || "")

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file.",
        variant: "destructive",
      })
      return
    }

    // 验证文件大小 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB.",
        variant: "destructive",
      })
      return
    }

    try {
      const uploadResult = await uploadFile(file)
      setSelectedAvatar(uploadResult.url)
      toast({
        title: "Upload Successful",
        description: "Image uploaded successfully. Click Save Changes to apply.",
      })
    } catch (error) {
      // 错误已在useProfile中处理
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleSave = async () => {
    if (!selectedAvatar) {
      toast({
        title: "No Avatar Selected",
        description: "Please select an avatar.",
        variant: "destructive",
      })
      return
    }

    if (selectedAvatar === user?.avatar) {
      toast({
        title: "No Changes",
        description: "The selected avatar is the same as your current one.",
        variant: "destructive",
      })
      return
    }

    try {
      await updateUserInfo({ avatar: selectedAvatar })
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
          <h1 className="text-lg font-bold">Change Avatar</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Current Avatar */}
        <Card>
          <CardHeader>
            <CardTitle>Current Avatar</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={selectedAvatar || "/placeholder.svg"} />
              <AvatarFallback>
                <Camera className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <Button 
              variant="outline" 
              className="w-full bg-transparent" 
              onClick={handleUploadClick}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? "Uploading..." : "Upload Custom Image"}
            </Button>
          </CardContent>
        </Card>

        {/* Avatar Options */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Choose from Gallery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {avatarOptions.map((avatar, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`relative rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedAvatar === avatar ? "border-accent" : "border-border hover:border-accent/50"
                  }`}
                  disabled={isUpdating || isUploading}
                >
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={avatar || "/placeholder.svg"} />
                    <AvatarFallback>A{index + 1}</AvatarFallback>
                  </Avatar>
                </button>
              ))}
            </div>
          </CardContent>
        </Card> */}

        <Button 
          onClick={handleSave} 
          className="w-full" 
          size="lg" 
          disabled={isUpdating || isUploading}
        >
          {isUpdating ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}
