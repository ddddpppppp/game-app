"use client"

import Image from "next/image"

interface BetPosition {
  betTypeId: string
  betTypeName: string
  amount: number
  chipImage: string
  x: number
  y: number
}

interface ChipOverlayProps {
  betPositions: BetPosition[]
  containerRef: React.RefObject<HTMLElement>
}

export function ChipOverlay({ betPositions, containerRef }: ChipOverlayProps) {
  const formatAmount = (amount: number): string => {
    if (amount > 1000) {
      return `${(amount / 1000).toFixed(1)}k`
    }
    return amount >= 1 ? amount.toString() : amount.toFixed(1)
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {betPositions.map(position => (
        <div
          key={position.betTypeId}
          className="absolute pointer-events-none"
          style={{
            left: position.x - 16,
            top: position.y - 16,
          }}
        >
          <div className="relative">
            <Image
              src={position.chipImage}
              alt={`${position.amount}`}
              width={32}
              height={32}
              className="rounded-full shadow-lg"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold text-xs drop-shadow-lg">
                {formatAmount(position.amount)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
