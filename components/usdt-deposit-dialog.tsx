"use client"

import { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Copy, CheckCircle, AlertCircle, Clock, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/lib/services/auth"

interface UsdtDepositDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  depositAddress: string
  usdtAmount: number
  orderNo: string
  expiredAt: string
}

export function UsdtDepositDialog({
  open,
  onOpenChange,
  depositAddress,
  usdtAmount,
  orderNo,
  expiredAt,
}: UsdtDepositDialogProps) {
  const [copiedAddress, setCopiedAddress] = useState(false)
  const [copiedAmount, setCopiedAmount] = useState(false)
  const [status, setStatus] = useState<string>('pending')
  const [statusText, setStatusText] = useState<string>('Pending')
  const [isExpired, setIsExpired] = useState(false)
  const [checking, setChecking] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  // 开始状态查询
  useEffect(() => {
    if (open && orderNo) {
      // 立即查询一次
      checkDepositStatus()
      
      // 设置定时查询
      intervalRef.current = setInterval(() => {
        checkDepositStatus()
      }, 10000) // 10秒查询一次
    }

    return () => {
      // 清理定时器
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [open, orderNo])

  // 当弹窗关闭或状态变为完成/过期时停止查询
  useEffect(() => {
    if (!open || status === 'completed' || status === 'failed' || isExpired) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [open, status, isExpired])

  const checkDepositStatus = async () => {
    try {
      setChecking(true)
      const result = await authService.getDepositStatus(orderNo)
      
      setStatus(result.status)
      setStatusText(result.status_text)
      setIsExpired(result.is_expired)

      // 如果状态变为成功，显示成功提示
      if (result.status === 'completed') {
        toast({
          title: "Deposit Confirmed!",
          description: "Your USDT deposit has been successfully confirmed.",
        })
      }
      
      // 如果订单过期，显示过期提示
      if (result.is_expired) {
        toast({
          title: "Order Expired",
          description: "This deposit order has expired. Please create a new one.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Failed to check deposit status:', error)
    } finally {
      setChecking(false)
    }
  }

  const copyToClipboard = async (text: string, type: 'address' | 'amount') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'address') {
        setCopiedAddress(true)
        setTimeout(() => setCopiedAddress(false), 2000)
      } else {
        setCopiedAmount(true)
        setTimeout(() => setCopiedAmount(false), 2000)
      }
      toast({
        title: "Copied!",
        description: `${type === 'address' ? 'Address' : 'Amount'} copied to clipboard`,
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const formatExpiredTime = (expiredAt: string) => {
    const expired = new Date(expiredAt)
    return expired.toLocaleString()
  }

  const getStatusBadge = () => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            {statusText}
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            {statusText}
          </Badge>
        )
      case 'failed':
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            {statusText}
          </Badge>
        )
      case 'expired':
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            {statusText}
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            {statusText}
          </Badge>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              USDT Deposit Created
            </div>
            <div className="flex items-center gap-2">
              {checking && <RefreshCw className="h-4 w-4 animate-spin" />}
              {getStatusBadge()}
            </div>
          </DialogTitle>
          <DialogDescription>
            Please transfer the exact amount to complete your deposit
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Info */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="text-sm text-muted-foreground">Order No:</div>
            <div className="font-mono text-sm">{orderNo}</div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Transfer Amount (USDT)</Label>
            <div className="flex gap-2">
              <Input
                id="amount"
                value={usdtAmount.toFixed(4)}
                readOnly
                className="font-mono text-lg font-semibold text-center"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() => copyToClipboard(usdtAmount.toFixed(4), 'amount')}
                disabled={status === 'completed' || isExpired}
              >
                {copiedAmount ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              ⚠️ Please transfer the exact amount shown above
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Deposit Address</Label>
            <div className="flex gap-2">
              <Input
                id="address"
                value={depositAddress}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() => copyToClipboard(depositAddress, 'address')}
                disabled={status === 'completed' || isExpired}
              >
                {copiedAddress ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Status specific messages */}
          {status === 'completed' && (
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <div className="font-medium text-green-800 mb-1">Deposit Confirmed!</div>
                  <div className="text-green-700 text-xs">
                    Your USDT deposit has been successfully processed and added to your account.
                  </div>
                </div>
              </div>
            </div>
          )}

          {(isExpired || status === 'expired') && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <div className="font-medium text-red-800 mb-1">Order Expired</div>
                  <div className="text-red-700 text-xs">
                    This deposit order has expired. Please create a new deposit order.
                  </div>
                </div>
              </div>
            </div>
          )}

          {status === 'pending' && !isExpired && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <div className="font-medium text-yellow-800 mb-1">Important Notes:</div>
                  <ul className="text-yellow-700 space-y-1 text-xs">
                    <li>• Only send USDT to this address</li>
                    <li>• Transfer exactly {usdtAmount.toFixed(4)} USDT</li>
                    <li>• Order expires at {formatExpiredTime(expiredAt)}</li>
                    <li>• Network confirmation may take 5-15 minutes</li>
                    <li>• Status updates automatically every 10 seconds</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            {status === 'pending' && !isExpired && (
              <Button 
                className="flex-1"
                onClick={() => copyToClipboard(depositAddress, 'address')}
              >
                Copy Address
              </Button>
            )}
            {(status === 'completed' || isExpired) && (
              <Button 
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Done
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 