"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Smartphone, Coins, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface WithdrawPageProps {
  onBack: () => void
}

export function WithdrawPage({ onBack }: WithdrawPageProps) {
  const [selectedMethod, setSelectedMethod] = useState<"cashapp" | "usdt" | null>(null)
  const [amount, setAmount] = useState("")
  const [address, setAddress] = useState("")
  const { toast } = useToast()

  const availableBalance = 1234.56

  const withdrawMethods = [
    {
      id: "cashapp" as const,
      name: "CashApp",
      icon: Smartphone,
      description: "Withdraw to your CashApp account",
      minAmount: 20,
      maxAmount: 2000,
      fee: "$2.50",
      processingTime: "1-3 business days",
    },
    {
      id: "usdt" as const,
      name: "USDT (Crypto)",
      icon: Coins,
      description: "Withdraw to your USDT wallet",
      minAmount: 50,
      maxAmount: 5000,
      fee: "Network fee (~$5)",
      processingTime: "10-30 minutes",
    },
  ]

  const handleWithdraw = () => {
    if (!selectedMethod || !amount) {
      toast({
        title: "Error",
        description: "Please select a withdrawal method and enter an amount",
        variant: "destructive",
      })
      return
    }

    const numAmount = Number.parseFloat(amount)
    const method = withdrawMethods.find((m) => m.id === selectedMethod)!

    if (numAmount < method.minAmount || numAmount > method.maxAmount) {
      toast({
        title: "Invalid Amount",
        description: `Amount must be between $${method.minAmount} and $${method.maxAmount}`,
        variant: "destructive",
      })
      return
    }

    if (numAmount > availableBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this withdrawal",
        variant: "destructive",
      })
      return
    }

    if (selectedMethod === "usdt" && !address) {
      toast({
        title: "Missing Address",
        description: "Please enter your USDT wallet address",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Withdrawal Requested",
      description: `Your $${amount} withdrawal via ${method.name} is being processed.`,
    })

    // Simulate processing
    setTimeout(() => {
      onBack()
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold">Withdraw Funds</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Available Balance */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Available Balance</span>
              <span className="text-lg font-semibold">${availableBalance.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Withdrawal Methods */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Select Withdrawal Method</h2>
          {withdrawMethods.map((method) => {
            const Icon = method.icon
            return (
              <Card
                key={method.id}
                className={`cursor-pointer transition-colors ${
                  selectedMethod === method.id ? "ring-2 ring-accent bg-accent/5" : "hover:bg-muted/50"
                }`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <Icon className="h-6 w-6 text-accent" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{method.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {method.fee}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Min: ${method.minAmount}</span>
                        <span>Max: ${method.maxAmount}</span>
                        <span>{method.processingTime}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Amount Input */}
        {selectedMethod && (
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="mb-2 block">
                  Amount (USD)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-lg"
                />
              </div>

              {selectedMethod === "usdt" && (
                <div className="space-y-2">
                  <Label htmlFor="address" className="mb-2 block">
                    USDT Wallet Address
                  </Label>
                  <Input
                    id="address"
                    placeholder="Enter your USDT wallet address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              )}

              {/* Warning */}
              <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Important Notice</p>
                  <p>
                    Withdrawals are processed within the stated timeframe. Please ensure your account details are
                    correct.
                  </p>
                </div>
              </div>

              <Button onClick={handleWithdraw} className="w-full" size="lg">
                Withdraw ${amount || "0.00"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
