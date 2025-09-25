"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

// Chip configurations
const chipConfigs = [
  { id: 1, value: 0.5, image: "/coin/01.png", color: "red" },
  { id: 2, value: 1, image: "/coin/02.png", color: "blue" },
  { id: 3, value: 5, image: "/coin/03.png", color: "green" },
  { id: 4, value: 10, image: "/coin/04.png", color: "yellow" },
  { id: 5, value: 50, image: "/coin/05.png", color: "purple" },
  { id: 6, value: 100, image: "/coin/06.png", color: "orange" },
]

interface ChipSelectorProps {
  onChipSelect: (value: number) => void
  selectedChip: number
  multiplier: number
  onMultiplierChange: (multiplier: number) => void
  onDoubleAllBets?: () => void
  onUndoLastBet?: () => void
  className?: string
}

export function ChipSelector({
  onChipSelect,
  selectedChip,
  multiplier,
  onMultiplierChange,
  onDoubleAllBets,
  onUndoLastBet,
  className = "",
}: ChipSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Get current selected chip config
  const selectedChipConfig = chipConfigs.find(chip => chip.value === selectedChip) || chipConfigs[0]
  
  // Calculate actual value (base value × multiplier)
  const actualValue = selectedChip * multiplier

  // Click outside to close expanded state
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false)
      }
    }

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isExpanded])

  const handleChipClick = (chipValue: number) => {
    onChipSelect(chipValue)
    setIsExpanded(false)
  }

//   const handleMultiplierIncrease = (e: React.MouseEvent) => {
//     e.stopPropagation()
//     if (multiplier < 64) {
//       onMultiplierChange(multiplier * 2)
//     }
//   }

//   const handleMultiplierDecrease = (e: React.MouseEvent) => {
//     e.stopPropagation()
//     if (multiplier > 1) {
//       onMultiplierChange(multiplier / 2)
//     }
//   }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Main chip button */}
      <div className="relative">
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative w-8 h-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 focus:outline-none"
        >
          <Image
            src={selectedChipConfig.image}
            alt={`${actualValue}`}
            fill
            className="object-cover rounded-full"
          />
          {/* Amount display without $ symbol */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-xs drop-shadow-lg">
              {actualValue >= 1 ? actualValue.toString() : actualValue.toFixed(1)}
            </span>
          </div>
        </button>
        

        {/* Multiplier control buttons */}
        {/* <div className="absolute -top-2 -right-2 flex flex-col gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMultiplierIncrease}
            disabled={multiplier >= 64}
            className="h-6 w-6 p-0 text-xs rounded-full bg-blue-500/80 hover:bg-blue-500 text-white disabled:opacity-50 shadow-lg"
          >
            ×
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMultiplierDecrease}
            disabled={multiplier <= 1}
            className="h-6 w-6 p-0 text-xs rounded-full bg-red-500/80 hover:bg-red-500 text-white disabled:opacity-50 shadow-lg"
          >
            ÷
          </Button>
        </div> */}

        {/* Multiplier display */}
        {/* {multiplier > 1 && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-lg">
              ×{multiplier}
            </span>
          </div>
        )} */}
      </div>

      {/* Expanded chip options */}
      {isExpanded && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-4/5">
          <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-3 shadow-2xl border border-white/20 w-[130px]">
            <div className="grid grid-cols-3 gap-3">
              {chipConfigs.map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => handleChipClick(chip.value)}
                  className={`relative w-8 h-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110 ${
                    chip.value === selectedChip ? 'ring-2 ring-yellow-400' : ''
                  }`}
                >
                  <Image
                    src={chip.image}
                    alt={`$${chip.value}`}
                    fill
                    className="object-cover rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-xs drop-shadow-lg">
                      {chip.value >= 1 ? chip.value.toString() : chip.value.toFixed(1)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
