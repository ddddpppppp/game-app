"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  User,
  Mail,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Camera,
  Edit3,
  Lock,
  Settings,
  Star,
  Trophy,
  LogOut,
  MessageCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useProfile } from "@/hooks/use-profile"

interface ProfilePageProps {
  onLogout?: () => void
}

export function ProfilePage({ onLogout }: ProfilePageProps) {
  const router = useRouter()
  const { user, isRefreshing } = useProfile()

  // 使用真实用户数据，如果没有则使用默认值
  const userData = {
    avatar: user?.avatar || "/keno_logo.png",
    nickname: user?.name || "Player",
    email: user?.email || "player@example.com",
    level: user?.level || 1, // 这些字段可能需要从其他 API 获取
    totalWins: user?.total_wins || 0,
    joinDate: user?.join_date || "Recently",
    balance: user?.balance || 0,
    vip: user?.vip || "Standard",
  }

  const mainMenuItems = [
    {
      icon: MessageCircle,
      title: "Customer Service",
      description: "Contact our support team",
      action: () => window.open("https://www.facebook.com/profile.php?id=61581219701236", "_blank"),
    },
    {
      icon: Wallet,
      title: "My Wallet",
      description: "View balance and transactions",
      action: () => router.push("/wallet"),
    },
    {
      icon: ArrowDownLeft,
      title: "Deposit",
      description: "Add funds to your account",
      action: () => router.push("/wallet/deposit"),
    },
    {
      icon: ArrowUpRight,
      title: "Withdraw",
      description: "Withdraw your winnings",
      action: () => router.push("/wallet/withdraw"),
    },
  ]

  const settingsMenuItems = [
    {
      icon: Camera,
      title: "Change Avatar",
      action: () => {
        console.log("Navigating to change avatar")
        router.push("/profile/change-avatar")
      },
    },
    {
      icon: Edit3,
      title: "Change Nickname",
      action: () => {
        console.log("Navigating to change nickname")
        router.push("/profile/change-nickname")
      },
    },
    {
      icon: Lock,
      title: "Change Password",
      action: () => {
        console.log("Navigating to change password")
        router.push("/profile/change-password")
      },
    },
    {
      icon: LogOut,
      title: "Logout",
      action: () => {
        console.log("Logging out")
        onLogout?.()
      },
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 relative">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">My Profile</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {settingsMenuItems.map((item, index) => {
                const Icon = item.icon
                return (
                  <DropdownMenuItem 
                    key={index} 
                    onClick={item.action}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.title}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="px-6 py-0 pt-6 pb-6">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={userData.avatar || "/keno_logo.png"} />
                <AvatarFallback>
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-sm font-bold">{userData.nickname}</h2>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    {userData.vip}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground mb-2">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{userData.email}</span>
                </div>
                <p className="text-xs text-muted-foreground">Member since {userData.joinDate}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="h-4 w-4 text-accent" />
                  <span className="font-semibold">{userData.level}</span>
                </div>
                <p className="text-xs text-muted-foreground">Level</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="font-semibold">{userData.totalWins}</span>
                </div>
                <p className="text-xs text-muted-foreground">Total Wins</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <CreditCard className="h-4 w-4 text-green-500" />
                  <span className="font-semibold">${userData.balance}</span>
                </div>
                <p className="text-xs text-muted-foreground">Balance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <div className="space-y-3">
          {mainMenuItems.map((item, index) => {
            const Icon = item.icon
            return (
              <Card key={index}>
                <CardContent className="p-0">
                  <Button variant="ghost" className="w-full h-auto p-4 justify-start" onClick={item.action}>
                    <div className="flex items-center gap-3 w-full">
                      <div className="p-2 bg-accent/10 rounded-lg">
                        <Icon className="h-5 w-5 text-accent" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
