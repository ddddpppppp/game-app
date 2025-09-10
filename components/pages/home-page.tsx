"use client"

import { GameCarousel } from "@/components/game-carousel"
import { GameGrid } from "@/components/game-grid"

export function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-card-foreground">GameHub</h1>
            <p className="text-xs text-muted-on-card">Welcome back, Player!</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-xs text-muted-on-card">Balance</p>
              <p className="text-sm font-semibold text-accent">$1,234.56</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="p-4 space-y-6">
        {/* Carousel section */}
        <GameCarousel />

        {/* Games grid */}
        <GameGrid />
      </div>
    </div>
  )
}
