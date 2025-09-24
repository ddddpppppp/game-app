"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Smartphone, Coins, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { TransactionHistory } from "@/components/transaction-history"
import { authService, type SystemSetting } from "@/lib/services/auth"
import { useProfile } from "@/hooks/use-profile"

interface WithdrawPageProps {
  onBack: () => void
}

export function WithdrawPage({ onBack }: WithdrawPageProps) {
  const [selectedMethod, setSelectedMethod] = useState<"cashapp" | "usdt" | "usdc_online" | null>(null)
  const [userBalance, setUserBalance] = useState(0)
  const [amount, setAmount] = useState("")
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [withdrawConfig, setWithdrawConfig] = useState<SystemSetting | null>(null)
  const [refreshTransactions, setRefreshTransactions] = useState(0)
  const { toast } = useToast()
  const { user, refreshUserInfo } = useProfile()

  useEffect(() => {
    loadWithdrawConfig()
    setUserBalance(user?.balance || 0)
  }, [user])

  const loadWithdrawConfig = async () => {
    try {
      const config = await authService.getSystemSettings('withdraw_setting')
      setWithdrawConfig(config)
    } catch (error) {
      console.error('Failed to load withdraw config:', error)
    }
  }

  const getWithdrawMethods = () => {
    if (!withdrawConfig) return []

    const { min_amount, max_amount, usdt_fee_rate, cashapp_fee_rate, usdc_online_fee_rate } = withdrawConfig.config
    const usdtFeePercent = (usdt_fee_rate || 0).toFixed(1)
    const cashappFeePercent = (cashapp_fee_rate || 0).toFixed(1)
    const usdcFeePercent = (usdc_online_fee_rate || 0).toFixed(1) // Use same fee rate as USDT

    return [
      {
        id: "cashapp" as const,
        name: "CashApp",
        icon: Smartphone,
        description: "Withdraw to your CashApp account",
        minAmount: min_amount,
        maxAmount: max_amount,
        fee: `${cashappFeePercent}%`,
        feeRate: cashapp_fee_rate || 0,
        processingTime: "1-3 hours",
      },
      {
        id: "usdt" as const,
        name: "USDT (Crypto)",
        icon: Coins,
        description: "Withdraw to your USDT wallet",
        minAmount: min_amount,
        maxAmount: max_amount,
        fee: `${usdtFeePercent}%`,
        feeRate: usdt_fee_rate || 0,
        processingTime: "1-5 minutes",
      },
      {
        id: "usdc_online" as const,
        name: "USDC (Crypto)",
        icon: Coins,
        description: "Withdraw to your USDC wallet",
        minAmount: min_amount,
        maxAmount: max_amount,
        fee: `${usdcFeePercent}%`,
        feeRate: usdt_fee_rate || 0,
        processingTime: "1-5 minutes",
      },
    ]
  }

  const withdrawMethods = getWithdrawMethods()

  const calculateFee = (amount: number) => {
    if (!withdrawConfig || !amount || !selectedMethod) return 0
    const method = withdrawMethods.find((m) => m.id === selectedMethod)
    if (!method) return 0
    return amount * method.feeRate / 100
  }

  const calculateActualAmount = (amount: number) => {
    return amount - calculateFee(amount)
  }

  const handleWithdraw = async () => {
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

    if (numAmount > userBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this withdrawal",
        variant: "destructive",
      })
      return
    }

    if ((selectedMethod === "usdt" || selectedMethod === "usdc_online") && !address) {
      toast({
        title: "Missing Address",
        description: `Please enter your ${selectedMethod.toUpperCase()} wallet address`,
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const result = await authService.createWithdraw(numAmount, selectedMethod, address)

      toast({
        title: "Withdrawal Requested",
        description: `Your withdrawal request has been submitted successfully`,
      })

      // 刷新交易记录和用户信息
      setRefreshTransactions(prev => prev + 1)
      setUserBalance((await refreshUserInfo()).balance || 0)

      // 清空表单
      setAmount("")
      setAddress("")
      setSelectedMethod(null)

    } catch (error: any) {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to create withdrawal request",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!withdrawConfig) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
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
              <span className="text-lg font-semibold">${userBalance}</span>
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

              {/* Fee and Actual Amount Display */}
              {amount && Number.parseFloat(amount) > 0 && (
                <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Withdrawal Amount:</span>
                    <span>${Number.parseFloat(amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Fee ({withdrawMethods.find(m => m.id === selectedMethod)?.feeRate.toFixed(1) || 0}%):</span>
                    <span>-${calculateFee(Number.parseFloat(amount)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold border-t pt-2">
                    <span>You will receive:</span>
                    <span>${calculateActualAmount(Number.parseFloat(amount)).toFixed(2)}</span>
                  </div>
                </div>
              )}

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

              {selectedMethod === "usdc_online" && (
                <div className="space-y-2">
                  <Label htmlFor="address" className="mb-2 block">
                    USDC Wallet Address
                  </Label>
                  <Input
                    id="address"
                    placeholder="Enter your USDC wallet address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              )}

              {selectedMethod === "cashapp" && (
                <div className="space-y-2">
                  <Label htmlFor="account" className="mb-2 block">
                    CashApp CashTag
                  </Label>
                  <Input
                    id="account"
                    placeholder="Enter your CashApp CashTag"
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
                    correct. Daily limit: {withdrawConfig.config.daily_limit} withdrawals per day.
                  </p>
                </div>
              </div>

              <Button 
                onClick={handleWithdraw} 
                className="w-full" 
                size="lg"
                disabled={loading}
              >
                {loading ? "Processing..." : `Withdraw $${amount || "0.00"}`}
              </Button>
            </CardContent>
          </Card>
        )}
        
        <TransactionHistory type="withdraw" refreshKey={refreshTransactions} />
      </div>
    </div>
  )
}
