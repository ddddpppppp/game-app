"use client"

import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react"
import { ChipSelector } from "./chip-selector"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { type BetType } from "@/lib/services/game"

// 筹码配置
const chipConfigs = [
  { id: 1, value: 0.5, image: "/coin/01.png", color: "red" },
  { id: 2, value: 1, image: "/coin/02.png", color: "blue" },
  { id: 3, value: 5, image: "/coin/03.png", color: "green" },
  { id: 4, value: 10, image: "/coin/04.png", color: "yellow" },
  { id: 5, value: 50, image: "/coin/05.png", color: "purple" },
  { id: 6, value: 100, image: "/coin/06.png", color: "orange" },
]

interface BetPosition {
  betTypeId: string
  betTypeName: string
  amount: number
  chipImage: string
  x: number
  y: number
}

interface FlyingChip {
  id: string
  chipImage: string
  startX: number
  startY: number
  endX: number
  endY: number
  duration: number
  startTime: number
}

interface BettingSystemProps {
  onBetsReady: (bets: Array<{ betTypeId: string; amount: number }>) => void
  canPlaceBet: boolean
  timeLeft: number
  selectedChip?: number
  multiplier?: number
  onChipSelect?: (value: number) => void
  onMultiplierChange?: (multiplier: number) => void
  onDoubleAllBets?: () => void
  onUndoLastBet?: () => void
  onClearBets?: () => void
  onSubmitBets?: () => void
  className?: string
}

export const BettingSystem = forwardRef<
  {
    handleBetTypeClick: (betType: BetType, targetElement: HTMLElement) => void
    clearInternalBets: () => void
  },
  BettingSystemProps
>(function BettingSystem({
  onBetsReady,
  canPlaceBet,
  timeLeft,
  onChipSelect,
  onMultiplierChange,
  onDoubleAllBets,
  onUndoLastBet,
  onClearBets,
  onSubmitBets,
  className = "",
}, ref) {
  const [selectedChip, setSelectedChip] = useState(0.5)
  const [multiplier, setMultiplier] = useState(1)
  
  // 使用外部传入的值或内部状态
  // const selectedChip = externalSelectedChip ?? internalSelectedChip
  // const multiplier = externalMultiplier ?? internalMultiplier
  const [betPositions, setBetPositions] = useState<BetPosition[]>([])
  const [flyingChips, setFlyingChips] = useState<FlyingChip[]>([])
  const animationRef = useRef<number>()
  const containerRef = useRef<HTMLDivElement>(null)

  // 计算实际投注金额
  const actualChipValue = selectedChip * multiplier

  // 获取筹码图片
  const getChipImage = (value: number) => {
    const baseValue = value / multiplier
    const config = chipConfigs.find(chip => chip.value === baseValue)
    return config?.image || chipConfigs[0].image
  }

  const chipSelectCallback = function(value: number) {
    setSelectedChip(value)
    onChipSelect?.(value)
  }

  const multiplierChangeCallback = function(value: number) {
    setMultiplier(value)
    onMultiplierChange?.(value)
  }

  // 处理投注类型点击
  const handleBetTypeClick = useCallback((betType: BetType, targetElement: HTMLElement) => {
    if (!canPlaceBet) return

    const chipSelectorElement = containerRef.current?.querySelector('.chip-selector')
    if (!chipSelectorElement || !targetElement) return

    // 获取起始位置（筹码选择器位置）
    const chipRect = chipSelectorElement.getBoundingClientRect()
    const targetRect = targetElement.getBoundingClientRect()
    
    const startX = chipRect.left + chipRect.width / 2
    const startY = chipRect.top + chipRect.height / 2
    const endX = targetRect.left + targetRect.width / 2
    const endY = targetRect.top + targetRect.height / 2

    // 创建飞行筹码
    const flyingChip: FlyingChip = {
      id: `chip-${Date.now()}-${Math.random()}`,
      chipImage: getChipImage(actualChipValue),
      startX,
      startY,
      endX,
      endY,
      duration: 800, // 800ms 动画
      startTime: Date.now(),
    }

    setFlyingChips(prev => [...prev, flyingChip])

    // 动画结束后添加到投注位置
    setTimeout(() => {
      setBetPositions(prev => {
        const existingIndex = prev.findIndex(pos => pos.betTypeId === betType.id.toString())
        const newPosition: BetPosition = {
          betTypeId: betType.id.toString(),
          betTypeName: betType.type_name,
          amount: existingIndex >= 0 ? prev[existingIndex].amount + actualChipValue : actualChipValue,
          chipImage: getChipImage(actualChipValue),
          x: endX,
          y: endY,
        }

        if (existingIndex >= 0) {
          const updated = [...prev]
          updated[existingIndex] = newPosition
          return updated
        } else {
          return [...prev, newPosition]
        }
      })

      // 移除飞行筹码
      setFlyingChips(prev => prev.filter(chip => chip.id !== flyingChip.id))
    }, flyingChip.duration)
  }, [canPlaceBet, actualChipValue, multiplier])

  // 飞行动画
  useEffect(() => {
    if (flyingChips.length === 0) return

    const animate = () => {
      const now = Date.now()
      setFlyingChips(prev => prev.filter(chip => now - chip.startTime < chip.duration))
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [flyingChips.length])

  // 当倒计时到30秒时清空所有投注（锁盘）
  useEffect(() => {
    if (timeLeft === 30) {
      setBetPositions([]) // 清除内部投注位置
      onClearBets?.() // 调用外部清空方法
    }
  }, [timeLeft, onClearBets])

  // 清除投注
  const clearBets = () => {
    setBetPositions([])
    // 如果有外部清除回调，也调用它
    if (onClearBets) {
      onClearBets()
    }
  }

  // 桌面筹码翻倍
  const doubleAllBets = () => {
    setBetPositions(prev => prev.map(pos => ({
      ...pos,
      amount: pos.amount * 2
    })))
    onDoubleAllBets?.()
  }

  // 撤回上一个投注
  const undoLastBet = () => {
    setBetPositions(prev => {
      if (prev.length === 0) return prev
      
      // 移除最后一个投注，或者如果最后一个投注有多个筹码，则减少一个筹码的金额
      const newPositions = [...prev]
      const lastPosition = newPositions[newPositions.length - 1]
      
      if (lastPosition.amount > selectedChip * multiplier) {
        // 如果最后一个投注有多个筹码，减少一个筹码的金额
        lastPosition.amount -= selectedChip * multiplier
      } else {
        // 如果只有一个筹码，移除整个投注
        newPositions.pop()
      }
      
      return newPositions
    })
    onUndoLastBet?.()
  }

  // 清空内部投注状态
  const clearInternalBets = () => {
    setBetPositions([])
  }

  // 使用 useImperativeHandle 暴露方法给 ref
  useImperativeHandle(ref, () => ({
    handleBetTypeClick,
    clearInternalBets,
  }))

  // 计算总投注金额
  const totalBetAmount = betPositions.reduce((sum, pos) => sum + pos.amount, 0)

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* 主筹码选择器 */}
      <div className="fixed right-4 top-1/2 translate-y-8 z-20 chip-selector">
        <ChipSelector
          selectedChip={selectedChip}
          multiplier={multiplier}
          onChipSelect={chipSelectCallback}
          onMultiplierChange={multiplierChangeCallback}
          onDoubleAllBets={doubleAllBets}
          onUndoLastBet={undoLastBet}
        />
      </div>

      {/* 飞行筹码动画 */}
      {flyingChips.map(chip => {
        const now = Date.now()
        const elapsed = now - chip.startTime
        const progress = Math.min(elapsed / chip.duration, 1)
        
        // 使用贝塞尔曲线创建抛物线效果
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        const currentX = chip.startX + (chip.endX - chip.startX) * easeOutQuart
        const currentY = chip.startY + (chip.endY - chip.startY) * easeOutQuart - Math.sin(progress * Math.PI) * 50

        return (
          <div
            key={chip.id}
            className="fixed pointer-events-none z-50"
            style={{
              left: currentX - 16,
              top: currentY - 16,
              transform: `scale(${1 + Math.sin(progress * Math.PI) * 0.2})`,
            }}
          >
            <Image
              src={chip.chipImage}
              alt="Flying chip"
              width={32}
              height={32}
              className="rounded-full shadow-lg"
            />
          </div>
        )
      })}

      {/* 投注位置显示 */}
      {/* {betPositions.map(position => (
        <div
          key={position.betTypeId}
          className="fixed pointer-events-none z-40"
          style={{
            left: position.x - 16,
            top: position.y - 16,
          }}
        >
          <div className="relative">
            <Image
              src={position.chipImage}
              alt={`$${position.amount}`}
              width={32}
              height={32}
              className="rounded-full shadow-lg"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold text-xs drop-shadow-lg">
                {position.amount >= 1 ? position.amount.toString() : position.amount.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      ))} */}

      {/* Betting Overview */}
      {betPositions.length > 0 && (
        <div className="fixed top-4 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-2 z-40">
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDoubleAllBets?.()}
              className="text-white hover:bg-white/20 bg-blue-600/80 hover:bg-blue-600 flex-1"
            >
              ×2
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onUndoLastBet?.()}
              className="text-white hover:bg-white/20 bg-gray-600/80 hover:bg-gray-600 flex-1"
            >
              ←
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearBets}
              className="text-white hover:bg-white/20 bg-red-600/80 hover:bg-red-600 flex-1"
            >
              Clear
            </Button>
            {timeLeft > 30 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSubmitBets?.()}
                className="text-white hover:bg-white/20 bg-green-600/80 hover:bg-green-600 flex-1"
              >
                Submit({timeLeft-30})
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                disabled
                className="text-white bg-gray-500/50 flex-1 cursor-not-allowed"
              >
                Closed
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
})
