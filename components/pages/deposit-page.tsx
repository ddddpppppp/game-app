"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Smartphone, Coins } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { TransactionHistory } from "@/components/transaction-history"
import { UsdtDepositDialog } from "@/components/usdt-deposit-dialog"
import { authService, type SystemSetting } from "@/lib/services/auth"

interface DepositPageProps {
  onBack: () => void
}

export function DepositPage({ onBack }: DepositPageProps) {
  const [selectedMethod, setSelectedMethod] = useState<"cashapp" | "usdt" | null>(null)
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [rechargeConfig, setRechargeConfig] = useState<SystemSetting | null>(null)
  const [usdtDialogOpen, setUsdtDialogOpen] = useState(false)
  const [usdtDepositInfo, setUsdtDepositInfo] = useState<{
    depositAddress: string
    usdtAmount: number
    orderNo: string
    expiredAt: string
  } | null>(null)
  const [refreshTransactions, setRefreshTransactions] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    loadRechargeConfig()
  }, [])

  const loadRechargeConfig = async () => {
    try {
      const config = await authService.getSystemSettings('recharge_setting')
      setRechargeConfig(config)
    } catch (error) {
      console.error('Failed to load recharge config:', error)
    }
  }

  const getPaymentMethods = () => {
    if (!rechargeConfig) return []

    const { min_amount, max_amount, cashapp_gift_rate, usdt_gift_rate } = rechargeConfig.config

    return [
      {
        id: "cashapp" as const,
        name: "CashApp",
        icon: Smartphone,
        description: "Instant deposit via CashApp",
        minAmount: min_amount,
        maxAmount: max_amount,
        giftRate: cashapp_gift_rate,
        processingTime: "Instant",
      },
      {
        id: "usdt" as const,
        name: "USDT (Crypto)",
        icon: Coins,
        description: "Deposit using USDT cryptocurrency",
        minAmount: min_amount,
        maxAmount: max_amount,
        giftRate: usdt_gift_rate,
        processingTime: "5-15 minutes",
      },
    ]
  }

  const paymentMethods = getPaymentMethods()

  const handleDeposit = async () => {
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

    try {
      setLoading(true)
      const result = await authService.createDeposit(numAmount, selectedMethod)

      if (selectedMethod === "cashapp" && result.payment_url) {
        // CashApp: 重定向到支付页面
        window.open(result.payment_url, '_blank')
        toast({
          title: "Redirecting to Payment",
          description: "Please complete the payment in the new window",
        })
      } else if (selectedMethod === "usdt") {
        // USDT: 显示弹窗
        setUsdtDepositInfo({
          depositAddress: result.deposit_address!,
          usdtAmount: result.usdt_amount!,
          orderNo: result.order_no,
          expiredAt: result.expired_at,
        })
        setUsdtDialogOpen(true)
      }

      // 刷新交易记录
      setRefreshTransactions(prev => prev + 1)

      // 清空表单
      setAmount("")
      setSelectedMethod(null)

    } catch (error: any) {
      toast({
        title: "Deposit Failed",
        description: error.message || "Failed to create deposit order",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getGiftText = (giftRate: number) => {
    if (giftRate > 0) {
      return `${(giftRate).toFixed(0)}% Bonus`
    }
    return "No Bonus"
  }

  const calculateGift = (amount: number, giftRate: number) => {
    if (giftRate > 0) {
      return amount * giftRate / 100
    }
    return 0
  }

  if (!rechargeConfig) {
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
          <h1 className="text-lg font-bold">Deposit Funds</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Payment Methods */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Select Payment Method</h2>
          {paymentMethods.map((method) => {
            const Icon = method.icon
            const giftAmount = amount ? calculateGift(Number.parseFloat(amount), method.giftRate) : 0
            
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
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${method.giftRate > 0 ? 'bg-green-100 text-green-800' : ''}`}
                        >
                          {getGiftText(method.giftRate)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Min: ${method.minAmount}</span>
                        <span>Max: ${method.maxAmount}</span>
                        <span>{method.processingTime}</span>
                      </div>
                      {selectedMethod === method.id && giftAmount > 0 && (
                        <div className="mt-2 text-sm text-green-600 font-medium">
                          You will receive ${giftAmount.toFixed(2)} bonus!
                        </div>
                      )}
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

              <Button 
                onClick={handleDeposit} 
                className="w-full" 
                size="lg"
                disabled={loading}
              >
                {loading ? "Processing..." : `Deposit $${amount || "0.00"}`}
              </Button>
            </CardContent>
          </Card>
        )}

        <TransactionHistory refreshKey={refreshTransactions} />
      </div>

      {/* USDT Deposit Dialog */}
      {usdtDepositInfo && (
        <UsdtDepositDialog
          open={usdtDialogOpen}
          onOpenChange={setUsdtDialogOpen}
          depositAddress={usdtDepositInfo.depositAddress}
          usdtAmount={usdtDepositInfo.usdtAmount}
          orderNo={usdtDepositInfo.orderNo}
          expiredAt={usdtDepositInfo.expiredAt}
        />
      )}
    </div>
  )
}
