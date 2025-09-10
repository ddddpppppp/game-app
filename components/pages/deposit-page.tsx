"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Smartphone, Coins } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DepositPageProps {
  onBack: () => void
}

export function DepositPage({ onBack }: DepositPageProps) {
  const [selectedMethod, setSelectedMethod] = useState<"cashapp" | "usdt" | null>(null)
  const [amount, setAmount] = useState("")
  const { toast } = useToast()

  const paymentMethods = [
    {
      id: "cashapp" as const,
      name: "CashApp",
      icon: Smartphone,
      description: "Instant deposit via CashApp",
      minAmount: 10,
      maxAmount: 5000,
      fee: "Free",
      processingTime: "Instant",
    },
    {
      id: "usdt" as const,
      name: "USDT (Crypto)",
      icon: Coins,
      description: "Deposit using USDT cryptocurrency",
      minAmount: 20,
      maxAmount: 10000,
      fee: "Network fee applies",
      processingTime: "5-15 minutes",
    },
  ]

  const handleDeposit = () => {
    if (!selectedMethod || !amount) {
      toast({
        title: "Error",
        description: "Please select a payment method and enter an amount",
        variant: "destructive",
      })
      return
    }

    const numAmount = Number.parseFloat(amount)
    const method = paymentMethods.find((m) => m.id === selectedMethod)!

    if (numAmount < method.minAmount || numAmount > method.maxAmount) {
      toast({
        title: "Invalid Amount",
        description: `Amount must be between $${method.minAmount} and $${method.maxAmount}`,
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Deposit Initiated",
      description: `Your $${amount} deposit via ${method.name} is being processed.`,
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
          <h1 className="text-lg font-bold">Deposit Funds</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Payment Methods */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Select Payment Method</h2>
          {paymentMethods.map((method) => {
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
              <CardTitle>Enter Amount</CardTitle>
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

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[50, 100, 250, 500].map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(quickAmount.toString())}
                  >
                    ${quickAmount}
                  </Button>
                ))}
              </div>

              <Button onClick={handleDeposit} className="w-full" size="lg">
                Deposit ${amount || "0.00"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
