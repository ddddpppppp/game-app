"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { authService, type Transaction } from "@/lib/services/auth"
import { useToast } from "@/hooks/use-toast"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface TransactionHistoryProps {
  type?: string // deposit, withdraw, all
  refreshKey?: number // 用于外部触发刷新
}

export function TransactionHistory({ type = "deposit", refreshKey }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadTransactions()
  }, [type, refreshKey])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      const response = await authService.getTransactionHistory({
        type: type === "all" ? undefined : type,
        limit: 10
      })
      setTransactions(response.transactions)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load transaction history",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "expired":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed"
      case "pending":
        return "Pending"
      case "failed":
        return "Failed"
      case "expired":
        return "Expired"
      default:
        return status
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No transactions found
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 border border-border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium capitalize">
                      {transaction.type}
                    </span>
                    <Badge 
                      variant="secondary" 
                      className={getStatusColor(transaction.status)}
                    >
                      {getStatusText(transaction.status)}
                    </Badge>
                    {transaction.type === 'withdraw' && transaction.status === 'failed' && transaction.remark && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-pointer text-red-500 hover:text-red-700 font-bold text-lg">
                              ?
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{transaction.remark}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {transaction.created_at}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    ${transaction.amount.toFixed(2)}
                  </div>
                  {transaction.type === 'withdraw' && transaction.fee > 0 && (
                    <div className="text-xs text-red-600">
                      -${transaction.fee.toFixed(2)} fee
                    </div>
                  )}
                  {transaction.type === 'deposit' && transaction.gift > 0 && (
                    <div className="text-xs text-green-600">
                      +${transaction.gift.toFixed(2)} gift
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
