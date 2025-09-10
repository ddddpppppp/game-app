"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Camera, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
  const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0])
  const { toast } = useToast()

  const handleSave = () => {
    toast({
      title: "Avatar Updated",
      description: "Your profile avatar has been successfully updated.",
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
            <Button variant="outline" className="w-full bg-transparent">
              <Upload className="h-4 w-4 mr-2" />
              Upload Custom Image
            </Button>
          </CardContent>
        </Card>

        {/* Avatar Options */}
        <Card>
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
                >
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={avatar || "/placeholder.svg"} />
                    <AvatarFallback>A{index + 1}</AvatarFallback>
                  </Avatar>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="w-full" size="lg">
          Save Changes
        </Button>
      </div>
    </div>
  )
}
