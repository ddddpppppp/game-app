import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownLeft, Plus, Minus } from "lucide-react"

interface Balance {
  id: string
  type: string
  amount: number
  description: string
  timestamp: string
}

const mockBalances: Balance[] = [
  {
    id: "1",
    type: "game bet",
    amount: -500.0,
    description: "game bet",
    timestamp: "2024-01-15 14:30",
  },
  {
    id: "2",
    type: "game win",
    amount: 125.5,
    description: "game win",
    timestamp: "2024-01-15 13:45",
  }
]

export function BalanceHistory() {
  const getBalanceIcon = (amount: number) => {
    if (amount > 0) {
      return <ArrowDownLeft className="h-4 w-4 text-green-500" />
    } else {
        return <ArrowUpRight className="h-4 w-4 text-red-500" />
    }
    return null
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
        <CardTitle className="text-lg">Wallet History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockBalances.map((balance) => (
          <div key={balance.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-full">{getBalanceIcon(balance.amount)}</div>
              <div>
                <p className="font-medium text-sm">{balance.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-muted-foreground">{balance.timestamp}</p>
                  {/* <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                      {balance.type}
                    </Badge> */}
                </div>
              </div>
            </div>
            <div className="text-right">
              {formatAmount(balance.amount)}
              {/* <div className="mt-1">{getStatusBadge(balance.status)}</div> */}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
