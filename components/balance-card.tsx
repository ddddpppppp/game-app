"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, TrendingUp, TrendingDown } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useProfile } from "@/hooks/use-profile"
import { authService, type DailyChange } from "@/lib/services/auth"

export function BalanceCard() {
  const [showBalance, setShowBalance] = useState(true)
  const [dailyChange, setDailyChange] = useState<DailyChange | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { user } = useProfile()

  useEffect(() => {
    loadDailyChange()
  }, [])

  const loadDailyChange = async () => {
    try {
      setLoading(true)
      const change = await authService.getDailyChange()
      setDailyChange(change)
    } catch (error) {
      console.error('Failed to load daily change:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeposit = () => {
    router.push("/wallet/deposit")
  }

  const handleWithdraw = () => {
    router.push("/wallet/withdraw")
  }

  const balance = user?.balance || 0
  const changeAmount = dailyChange?.today_change || 0
  const changePercent = dailyChange?.today_change_percent || 0

  return (
    <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-90">Total Balance</p>
            <div className="flex items-center gap-2">
              {showBalance ? (
                <h2 className="text-3xl font-bold">${balance.toFixed(2)}</h2>
              ) : (
                <h2 className="text-3xl font-bold">****.**</h2>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20"
                onClick={() => setShowBalance(!showBalance)}
              >
                {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {!loading && dailyChange && (
          <div className="flex items-center gap-2 mb-6">
            {changeAmount >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-300" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-300" />
            )}
            <span className="text-sm">
              {changeAmount >= 0 ? "+" : ""}${Math.abs(changeAmount).toFixed(2)} ({changePercent >= 0 ? "+" : ""}
              {changePercent.toFixed(1)}%) today
            </span>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 mb-6">
            <div className="h-4 w-4 rounded bg-primary-foreground/20 animate-pulse" />
            <div className="h-4 w-24 rounded bg-primary-foreground/20 animate-pulse" />
          </div>
        )}

        <div className="flex gap-3">
          <Button onClick={handleDeposit} className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
            Deposit
          </Button>
          <Button
            onClick={handleWithdraw}
            variant="outline"
            className="flex-1 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
          >
            Withdraw
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
