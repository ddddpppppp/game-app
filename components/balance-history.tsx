"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownLeft, Plus, Minus } from "lucide-react"
import { useState, useEffect } from "react"
import { authService, type BalanceHistory as BalanceHistoryType } from "@/lib/services/auth"
import { useToast } from "@/hooks/use-toast"

export function BalanceHistory() {
  const [balances, setBalances] = useState<BalanceHistoryType[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadBalanceHistory()
  }, [])

  const loadBalanceHistory = async () => {
    try {
      setLoading(true)
      const response = await authService.getBalanceHistory({
        limit: 10
      })
      setBalances(response.balance_list)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load balance history",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getBalanceIcon = (amount: number) => {
    if (amount > 0) {
      return <ArrowDownLeft className="h-4 w-4 text-green-500" />
    } else {
      return <ArrowUpRight className="h-4 w-4 text-red-500" />
    }
  }

  const formatAmount = (amount: number) => {
    const isPositive = amount > 0
    return (
      <span className={isPositive ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
        {isPositive ? "+" : ""}${Math.abs(amount).toFixed(2)}
      </span>
    )
  }

  const getTypeDisplay = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'deposit': 'Deposit',
      'withdraw': 'Withdraw',
      'game bet': 'Game Bet',
      'game win': 'Game Win',
    }
    return typeMap[type] || type
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Wallet History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-full animate-pulse">
                    <div className="h-4 w-4 bg-muted-foreground/20 rounded" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-muted-foreground/20 rounded animate-pulse" />
                    <div className="h-3 w-32 bg-muted-foreground/20 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-5 w-16 bg-muted-foreground/20 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Wallet History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {balances.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No transaction history found
          </div>
        ) : (
          balances.map((balance) => (
            <div key={balance.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-full">{getBalanceIcon(balance.amount)}</div>
                <div>
                  <p className="font-medium text-sm">{getTypeDisplay(balance.type)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">{balance.created_at}</p>
                  </div>
                  {balance.description && (
                    <p className="text-xs text-muted-foreground mt-1">{balance.description}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                {formatAmount(balance.amount)}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
