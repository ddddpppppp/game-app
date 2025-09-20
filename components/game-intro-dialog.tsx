"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface GameIntroDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GameIntroDialog({ open, onOpenChange }: GameIntroDialogProps) {
  const handleClose = () => {
    // 设置本地存储标记，表示用户已经看过介绍
    localStorage.setItem('canada28-intro-shown', 'true')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full max-h-[90vh] sm:max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">🎯 Canada 28 Keno Game Guide</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Real-time lottery game based on official BCLC data
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Game Overview */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              🎲 Game Overview
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
              <p className="text-blue-800">
                Canada 28 Keno game uses draw data from PlayNow.com, a gaming and entertainment website 
                officially licensed by the British Columbia Lottery Corporation (BCLC). Draws are held 
                every three and a half minutes, with daily maintenance scheduled from 6:00 to 6:30 Pacific Time (UTC-8).
              </p>
            </div>
          </div>

          {/* Draw Rules */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              📋 Draw Rules
            </h3>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                BCLC draws 20 numbers as the base for each round. Canada 28 calculates the results as follows:
              </p>
              
              <div className="grid gap-3">
                <div className="bg-card border rounded-lg p-3">
                  <div className="text-sm space-y-2">
                    <div className="font-medium">1️⃣ Arrange the 20 drawn numbers in ascending order</div>
                    
                    <div className="font-medium">2️⃣ Calculate three zone values:</div>
                    <div className="ml-4 space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Zone 1</Badge>
                        <span>Sum 2nd, 5th, 8th, 11th, 14th, 17th numbers, take last digit</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Zone 2</Badge>
                        <span>Sum 3rd, 6th, 9th, 12th, 15th, 18th numbers, take last digit</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Zone 3</Badge>
                        <span>Sum 4th, 7th, 10th, 13th, 16th, 19th numbers, take last digit</span>
                      </div>
                    </div>
                    
                    <div className="font-medium">3️⃣ Add the three zone values to get final result (range 0-27)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Example Demonstration */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              💡 Example Demonstration
            </h3>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="text-sm space-y-3">
                <div className="font-medium text-amber-800">BCLC draw #1749110 numbers (sorted in ascending order):</div>
                <div className="text-xs text-amber-700 font-mono">
                  7, 8, 14, 16, 17, 22, 26, 34, 39, 41, 42, 48, 54, 58, 63, 64, 69, 72, 73, 79
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <Badge className="bg-red-100 text-red-800 border-red-300">Zone 1</Badge>
                    <span className="font-mono">8 + 17 + 34 + 42 + 58 + 69 = 228 → Last digit 8</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Badge className="bg-green-100 text-green-800 border-green-300">Zone 2</Badge>
                    <span className="font-mono">14 + 22 + 39 + 48 + 63 + 72 = 258 → Last digit 8</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Badge className="bg-blue-100 text-blue-800 border-blue-300">Zone 3</Badge>
                    <span className="font-mono">16 + 26 + 41 + 54 + 64 + 73 = 274 → Last digit 4</span>
                  </div>
                </div>
                
                <div className="border-t border-amber-300 pt-2">
                  <div className="text-center font-bold text-amber-800">
                    Final result: 8 + 8 + 4 = <span className="text-lg">20</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Game Features */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              ⭐ Game Features
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-card border rounded-lg p-3">
                <div className="font-medium mb-1">🕐 Real-time Draws</div>
                <div className="text-muted-foreground">Draws every 3.5 minutes with live data updates</div>
              </div>
              <div className="bg-card border rounded-lg p-3">
                <div className="font-medium mb-1">🏛️ Official Data</div>
                <div className="text-muted-foreground">Based on BCLC official licensed data source</div>
              </div>
              <div className="bg-card border rounded-lg p-3">
                <div className="font-medium mb-1">🎯 Multiple Bet Types</div>
                <div className="text-muted-foreground">Basic, combination, and special bets</div>
              </div>
              <div className="bg-card border rounded-lg p-3">
                <div className="font-medium mb-1">💬 Live Chat</div>
                <div className="text-muted-foreground">Real-time interaction with other players</div>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-medium text-orange-800 mb-2">⚠️ Important Notes</h4>
            <ul className="text-xs text-orange-700 space-y-1">
              <li>• Betting stops 30 seconds before each draw</li>
              <li>• Daily maintenance: 6:00-6:30 Pacific Time</li>
              <li>• Monday delays may occur (subject to BCLC announcements)</li>
              <li>• Please play responsibly and enjoy moderately</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <Button onClick={handleClose} className="w-full sm:w-auto px-8">
            Start Playing 🚀
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// 检查是否需要显示游戏介绍的工具函数
export function shouldShowGameIntro(): boolean {
  if (typeof window === 'undefined') return false
  return !localStorage.getItem('canada28-intro-shown')
}
