import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownLeft, Plus, Minus } from "lucide-react"

interface Transaction {
  id: string
  type: "deposit" | "withdraw" | "win" | "bet"
  amount: number
  description: string
  timestamp: string
  status: "completed" | "pending" | "failed"
  method?: string
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "deposit",
    amount: 500.0,
    description: "Deposit via CashApp",
    timestamp: "2024-01-15 14:30",
    status: "completed",
    method: "CashApp",
  },
  {
    id: "2",
    type: "win",
    amount: 125.5,
    description: "Texas Hold'em Poker - Win",
    timestamp: "2024-01-15 13:45",
    status: "completed",
  },
  {
    id: "3",
    type: "bet",
    amount: -50.0,
    description: "Lightning Slots - Bet",
    timestamp: "2024-01-15 13:20",
    status: "completed",
  },
  {
    id: "4",
    type: "withdraw",
    amount: -200.0,
    description: "Withdraw to USDT Wallet",
    timestamp: "2024-01-14 16:15",
    status: "pending",
    method: "USDT",
  },
  {
    id: "5",
    type: "deposit",
    amount: 1000.0,
    description: "Deposit via USDT",
    timestamp: "2024-01-14 10:30",
    status: "completed",
    method: "USDT",
  },
  {
    id: "6",
    type: "win",
    amount: 75.25,
    description: "Blackjack Pro - Win",
    timestamp: "2024-01-13 20:45",
    status: "completed",
  },
]

export function TransactionHistory() {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />
      case "withdraw":
        return <ArrowUpRight className="h-4 w-4 text-red-500" />
      case "win":
        return <Plus className="h-4 w-4 text-green-500" />
      case "bet":
        return <Minus className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Completed
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        )
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return null
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Transaction History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockTransactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-full">{getTransactionIcon(transaction.type)}</div>
              <div>
                <p className="font-medium text-sm">{transaction.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-muted-foreground">{transaction.timestamp}</p>
                  {transaction.method && (
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                      {transaction.method}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              {formatAmount(transaction.amount)}
              <div className="mt-1">{getStatusBadge(transaction.status)}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
