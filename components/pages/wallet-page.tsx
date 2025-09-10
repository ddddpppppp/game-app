"use client"
import { BalanceCard } from "@/components/balance-card"
import { TransactionHistory } from "@/components/transaction-history"

export function WalletPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3">
        <h1 className="text-lg font-bold">My Wallet</h1>
        <p className="text-sm text-muted-foreground">Manage your funds and transactions</p>
      </div>

      {/* Main content */}
      <div className="p-4 space-y-6">
        {/* Balance Card */}
        <BalanceCard />

        {/* Transaction History */}
        <TransactionHistory />
      </div>
    </div>
  )
}
