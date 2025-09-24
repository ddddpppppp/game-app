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
import { IframeDialog } from "@/components/iframe-dialog"
import { authService, type SystemSetting } from "@/lib/services/auth"

interface DepositPageProps {
  onBack: () => void
}

export function DepositPage({ onBack }: DepositPageProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1)
  const [selectedMethod, setSelectedMethod] = useState<"cashapp" | "usdt" | "usdc_online" | null>(null)
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
  const [iframeDialogOpen, setIframeDialogOpen] = useState(false)
  const [iframeUrl, setIframeUrl] = useState("")
  const [iframeTitle, setIframeTitle] = useState("")
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

    const { 
      usdt_min_amount, 
      usdt_max_amount, 
      cashapp_min_amount, 
      cashapp_max_amount, 
      usdc_online_min_amount, 
      usdc_online_max_amount,
      cashapp_gift_rate, 
      usdt_gift_rate,
      usdc_online_gift_rate 
    } = rechargeConfig.config

    return [
      {
        id: "usdc_online" as const,
        name: "USDC Online",
        icon: Coins,
        description: "Use fiat currency to buy USDC directly and deposit it into your wallet.",
        minAmount: usdc_online_min_amount,
        maxAmount: usdc_online_max_amount,
        giftRate: usdc_online_gift_rate,
        processingTime: "Instant",
        isOnline: true,
      },
      {
        id: "usdt" as const,
        name: "USDT (Crypto)",
        icon: Coins,
        description: "Deposit using USDT cryptocurrency",
        minAmount: usdt_min_amount,
        maxAmount: usdt_max_amount,
        giftRate: usdt_gift_rate,
        processingTime: "1-5 minutes",
      },
      {
        id: "cashapp" as const,
        name: "CashApp",
        icon: Smartphone,
        description: "Instant deposit via CashApp",
        minAmount: cashapp_min_amount,
        maxAmount: cashapp_max_amount,
        giftRate: cashapp_gift_rate,
        processingTime: "Instant",
      },
    ]
  }

  const paymentMethods = getPaymentMethods()

  const handleMethodSelect = (methodId: "cashapp" | "usdt" | "usdc_online") => {
    setSelectedMethod(methodId)
    // 直接进入下一步
    setTimeout(() => {
      setCurrentStep(2)
    }, 150) // 短暂延迟让用户看到选择效果
  }

  const handleBackToStep1 = () => {
    setCurrentStep(1)
    setAmount("")
  }

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
        // CashApp: 显示弹层
        setIframeUrl(result.payment_url)
        setIframeTitle("CashApp Payment")
        setIframeDialogOpen(true)
        toast({
          title: "Payment Ready",
          description: "Please complete the CashApp payment",
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
      } else if (selectedMethod === "usdc_online" && result.payment_url) {
        // USDC Online: 显示弹层
        setIframeUrl(result.payment_url)
        setIframeTitle("USDC Online Payment")
        setIframeDialogOpen(true)
        toast({
          title: "Payment Ready",
          description: "Please complete the USDC payment",
        })
      }

      // 刷新交易记录
      setRefreshTransactions(prev => prev + 1)

      // 清空表单并返回第一步
      setAmount("")
      setSelectedMethod(null)
      setCurrentStep(1)

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

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
        currentStep === 1 ? 'bg-accent text-accent-foreground' : 'bg-accent text-accent-foreground'
      }`}>
        1
      </div>
      <div className="w-8 h-1 bg-muted rounded-full">
        <div className={`h-full bg-accent rounded-full transition-all duration-300 ${
          currentStep === 2 ? 'w-full' : 'w-0'
        }`} />
      </div>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
        currentStep === 2 ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
      }`}>
        2
      </div>
    </div>
  )

  const renderStep1 = () => (
    <div className="space-y-6">
      {renderStepIndicator()}
      
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold">Choose Payment Method</h2>
        <p className="text-muted-foreground">Select your preferred payment option</p>
      </div>

      <div className="space-y-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon
          
          return (
            <Card
              key={method.id}
              className={`cursor-pointer transition-colors ${
                selectedMethod === method.id ? "ring-2 ring-accent bg-accent/5" : "hover:bg-muted/50"
              }`}
              onClick={() => handleMethodSelect(method.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">
                        {method.id === "usdc_online" ? (
                          <>
                            USDC <span className="text-accent font-bold">Online</span>
                          </>
                        ) : (
                          method.name
                        )}
                      </h3>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${method.giftRate > 0 ? 'bg-green-100 text-green-800' : ''}`}
                      >
                        {getGiftText(method.giftRate)}
                      </Badge>
                      {method.id === "usdc_online" && (
                        <Badge variant="secondary" className="text-xs bg-accent/20 text-accent border-accent">
                          Fast
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Min: ${method.minAmount}</span>
                      <span>Max: ${method.maxAmount}</span>
                      <span>{method.processingTime}</span>
                    </div>
                  </div>
                  {selectedMethod === method.id && (
                    <div className="w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

    </div>
  )

  const renderStep2 = () => {
    const selectedMethodData = paymentMethods.find(m => m.id === selectedMethod)!
    const giftAmount = amount ? calculateGift(Number.parseFloat(amount), selectedMethodData.giftRate) : 0
    
    return (
      <div className="space-y-6">
        {renderStepIndicator()}
        
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold">Enter Amount</h2>
          <p className="text-muted-foreground">
            How much would you like to deposit via {selectedMethodData.name}?
          </p>
        </div>

        {/* Selected Method Summary */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <selectedMethodData.icon className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">
                  {selectedMethodData.id === "usdc_online" ? (
                    <>
                      USDC <span className="text-accent font-bold">Online</span>
                    </>
                  ) : (
                    selectedMethodData.name
                  )}
                </h3>
                {/* <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Min: ${selectedMethodData.minAmount}</span>
                  <span>Max: ${selectedMethodData.maxAmount}</span>
                  <span>{selectedMethodData.processingTime}</span>
                </div> */}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBackToStep1}
                className="text-accent"
              >
                Change
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Amount Input */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-base font-medium">
                Amount (USD)
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-xl h-12 text-center"
                autoFocus
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[20, 50, 100, 300].map((quickAmount) => (
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

            {/* Gift Amount Display */}
            {amount && giftAmount > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <div className="text-green-800 font-medium">
                  🎁 Bonus: ${giftAmount.toFixed(2)}
                </div>
                <div className="text-sm text-green-600">
                  Total you'll receive: ${(Number.parseFloat(amount) + giftAmount).toFixed(2)}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={handleBackToStep1}
                size="lg"
              >
                Back
              </Button>
              <Button 
                onClick={handleDeposit} 
                size="lg"
                disabled={loading || !amount}
              >
                {loading ? "Processing..." : `Deposit $${amount || "0.00"}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={currentStep === 1 ? onBack : handleBackToStep1}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold">Deposit Funds</h1>
        </div>
      </div>

      <div className="p-4">
        {currentStep === 1 ? renderStep1() : renderStep2()}
        
        {/* Transaction History - Only show on step 1 */}
        {currentStep === 1 && (
          <div className="mt-8">
            <TransactionHistory refreshKey={refreshTransactions} />
          </div>
        )}
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

      {/* Iframe Dialog */}
      <IframeDialog
        open={iframeDialogOpen}
        onOpenChange={setIframeDialogOpen}
        url={iframeUrl}
        title={iframeTitle}
      />
    </div>
  )
}
