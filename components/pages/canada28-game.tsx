"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Info, Bot, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface ChatMessage {
  id: string
  type: "user" | "bot"
  content: string
  timestamp: Date
}

interface BetType {
  id: string
  name: string
  multiplier: string
}



// 投注分类
const betCategories = [
  { id: "basic", name: "Basic Bets", icon: "🎯" },
  { id: "combination", name: "Combination Bets", icon: "🎲" },
  { id: "special", name: "Special Bets", icon: "⭐" },
  { id: "sum", name: "The Sum", icon: "🔢" },
]

// 分组投注选项
const betGroups = {
  basic: [
    { id: "big", name: "Big", multiplier: "3.0x" },
    { id: "small", name: "Small", multiplier: "3.0x" },
    { id: "odd", name: "Odd", multiplier: "3.0x" },
    { id: "even", name: "Even", multiplier: "3.0x" },
  ],
  combination: [
    { id: "big-odd", name: "Big Odd", multiplier: "6.5x" },
    { id: "small-odd", name: "Small Odd", multiplier: "6.5x" },
    { id: "big-even", name: "Big Even", multiplier: "6.5x" },
    { id: "small-even", name: "Small Even", multiplier: "6.5x" },
  ],
  special: [
    { id: "extreme-small", name: "Extreme Small", multiplier: "10x" },
    { id: "extreme-big", name: "Extreme Big", multiplier: "10x" },
    { id: "triple", name: "Triple", multiplier: "50x" },
    { id: "double", name: "Double", multiplier: "3x" },
    { id: "straight", name: "Straight", multiplier: "10x" },
  ]
}

// 特码选项 (0-27)
const sumOptions: BetType[] = Array.from({length: 28}, (_, i) => ({
  id: `sum-${i}`,
  name: `${i}`,
  multiplier: i === 0 || i === 1 || i === 26 || i === 27 ? "280x" : 
              i === 2 || i === 25 ? "60x" :
              i === 3 || i === 24 ? "40x" :
              i === 4 || i === 23 ? "30x" :
              i === 5 || i === 22 ? "25x" :
              i === 6 || i === 21 ? "22x" :
              i === 7 || i === 20 ? "20x" :
              i === 8 || i === 19 ? "18x" :
              i === 9 || i === 18 ? "16x" :
              i === 10 || i === 17 ? "15x" :
              i === 11 || i === 16 ? "14x" :
              i === 12 || i === 15 ? "13x" :
              i === 13 || i === 14 ? "12x" : "1x"
}))

const quickAmounts = [10, 50, 100, 500, 1000]

export function Canada28Game() {
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "bot",
      content: "Welcome to Canada 28! Place your bets and good luck! 🍀",
      timestamp: new Date(),
    },
  ])

  const [selectedBetType, setSelectedBetType] = useState<BetType | null>(null)
  const [betAmount, setBetAmount] = useState("")
  const [balance] = useState(5000) // Mock balance
  const [showRules, setShowRules] = useState(true)
  const [activeTab, setActiveTab] = useState<"bet" | "bet-history" | "draw-history" | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  
  // Lottery state
  const [currentPeriod] = useState(3333197)
  const [timeLeft, setTimeLeft] = useState(180) // 3 minutes in seconds
  const [isDrawing, setIsDrawing] = useState(false)
  
  const { toast } = useToast()

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsDrawing(true)
          // Simulate drawing for 10 seconds
          setTimeout(() => {
            setIsDrawing(false)
            setTimeLeft(180) // Reset to 3 minutes
          }, 10000)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleBack = () => {
    router.back()
  }

  const handlePlaceBet = () => {
    if (isDrawing) {
      toast({
        title: "Drawing in Progress",
        description: "Please wait for the current draw to complete.",
        variant: "destructive",
      })
      return
    }

    if (!selectedBetType || !betAmount || Number.parseFloat(betAmount) <= 0) {
      toast({
        title: "Invalid Bet",
        description: "Please select a bet type and enter a valid amount.",
        variant: "destructive",
      })
      return
    }

    const amount = Number.parseFloat(betAmount)
    if (amount > balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this bet.",
        variant: "destructive",
      })
      return
    }

    // Add user bet message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: `Bet $${amount} on ${selectedBetType.name} (${selectedBetType.multiplier})`,
      timestamp: new Date(),
    }

    // Add bot response
    const botMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: "bot",
      content: `✅ Bet confirmed! $${amount} on ${selectedBetType.name}. Remaining balance: $${balance - amount}`,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage, botMessage])

    // Reset bet selection
    setSelectedBetType(null)
    setBetAmount("")
    setSelectedCategory(null)

    toast({
      title: "Bet Placed!",
      description: `$${amount} bet on ${selectedBetType.name}`,
    })
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="font-bold text-lg text-foreground">Keno #{currentPeriod}</h1>
              <div className="flex items-center gap-2 text-sm">
                {isDrawing ? (
                  <span className="text-orange-500 font-medium">Drawing...</span>
                ) : (
                  <>
                    <span className="text-muted-foreground">Current draw:</span>
                    <span className="font-mono font-semibold text-blue-600">{formatTime(timeLeft)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Dialog open={showRules} onOpenChange={setShowRules}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-foreground bg-transparent">
                <Info className="w-4 h-4 mr-2" />
                Rules
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] w-full max-h-[80vh] sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Keno Game Rules</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-96">
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">1. Big / Small</h4>
                    <p>Small: 0–13, Big: 14–27</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">2. Odd / Even</h4>
                    <p>Based on whether the total is an odd or even number</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">3. Triple</h4>
                    <p>All three digits identical (e.g., 222, 111).</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">4. Double</h4>
                    <p>Any two digits are identical (e.g., 011, 010).</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">5. Straight</h4>
                    <p>Three consecutive digits, regardless of order (e.g., 123, 231).</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">6. Combination Bets</h4>
                    <p>Big Odd: 15, 17, 19, 21, 23, 25, 27</p>
                    <p>Small Odd: 01, 03, 05, 07, 09, 11, 13</p>
                    <p>Big Even: 14, 16, 18, 20, 22, 24, 26</p>
                    <p>Small Even: 00, 02, 04, 06, 08, 10, 12</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">7. Extreme Bets</h4>
                    <p>Extreme Small: 0–5, Extreme Big: 22–27</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">8. The Sum (0-27)</h4>
                    <p>Select any exact total from 0–27.</p>
                  </div>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden pb-32">
        <ScrollArea className="h-full px-4 py-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex gap-2 max-w-[75%] sm:max-w-[80%] ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === "user" ? "bg-accent" : "bg-muted"
                    }`}
                  >
                    {message.type === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div
                    className={`rounded-lg px-3 py-2 ${
                      message.type === "user" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <p className="text-sm break-words">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Bottom Interface */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-20 shadow-lg">
        {!activeTab ? (
          <div className="p-4">
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                className="h-12 bg-card text-foreground hover:bg-accent hover:text-accent-foreground"
                onClick={() => setActiveTab("bet")}
              >
                Bet
              </Button>
              <Button
                variant="outline"
                className="h-12 bg-card text-foreground hover:bg-accent hover:text-accent-foreground"
                onClick={() => setActiveTab("bet-history")}
              >
                Bet History
              </Button>
              <Button
                variant="outline"
                className="h-12 bg-card text-foreground hover:bg-accent hover:text-accent-foreground"
                onClick={() => setActiveTab("draw-history")}
              >
                Draw History
              </Button>
            </div>
          </div>
        ) : activeTab === "bet" ? (
          <div className="p-4 space-y-4">
            {!selectedCategory ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground">Select Bet Category</h3>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab(null)} className="text-foreground">
                    Close
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3 p-2">
                  {betCategories.map((category) => (
                    <Button
                      key={category.id}
                      variant="outline"
                      className="h-auto min-h-[80px] p-3 bg-card text-foreground hover:bg-accent hover:text-accent-foreground flex flex-col justify-center items-center text-center"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <span className="text-2xl mb-2">{category.icon}</span>
                      <span className="font-bold text-xs leading-tight">{category.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ) : !selectedBetType ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground">
                    {betCategories.find((c) => c.id === selectedCategory)?.name}
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(null)} className="text-foreground">
                    Back
                  </Button>
                </div>
                {selectedCategory === "sum" ? (
                  <ScrollArea>
                    <div className="grid grid-cols-4 gap-2 p-2">
                      {sumOptions.map((bet) => (
                        <Button
                          key={bet.id}
                          variant="outline"
                          className="h-auto min-h-[50px] p-2 bg-card text-foreground hover:bg-accent hover:text-accent-foreground flex flex-col justify-center items-center text-center"
                          onClick={() => setSelectedBetType(bet)}
                        >
                          <span className="font-bold text-xs">{bet.name}</span>
                          <span className="text-xs text-muted-foreground">{bet.multiplier}</span>
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="grid grid-cols-2 gap-2 p-2">
                    {betGroups[selectedCategory as keyof typeof betGroups]?.map((bet) => (
                      <Button
                        key={bet.id}
                        variant="outline"
                        className="h-auto min-h-[60px] p-2 bg-card text-foreground hover:bg-accent hover:text-accent-foreground flex flex-col justify-center items-center text-center"
                        onClick={() => setSelectedBetType(bet)}
                      >
                        <span className="font-bold text-xs leading-tight break-words">{bet.name}</span>
                        <span className="text-xs text-muted-foreground mt-1">{bet.multiplier}</span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{selectedBetType?.name}</h3>
                    <p className="text-sm text-muted-foreground">Multiplier: {selectedBetType?.multiplier}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedBetType(null)}
                    className="text-foreground"
                  >
                    Back
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    {quickAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setBetAmount(amount.toString())}
                        className="flex-1 text-foreground"
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handlePlaceBet} 
                      className="px-6" 
                      disabled={isDrawing}
                    >
                      {isDrawing ? "Drawing..." : "Bet"}
                    </Button>
                  </div>

                  {/* Balance and potential winnings display */}
                  <div className="bg-muted/50 rounded-lg p-3 border space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Current Balance:</span>
                      <span className="font-semibold text-foreground">${balance}</span>
                    </div>
                    
                    {betAmount && Number.parseFloat(betAmount) > 0 && (
                      <>
                        <div className="border-t border-border pt-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Potential Winnings:</span>
                            <span className="font-semibold text-green-600">
                              ${selectedBetType ? (Number.parseFloat(betAmount) * Number.parseFloat(selectedBetType.multiplier.replace('x', ''))).toFixed(2) : '0.00'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                            <span>Your bet: ${Number.parseFloat(betAmount).toFixed(2)}</span>
                            <span>Profit: ${selectedBetType ? ((Number.parseFloat(betAmount) * Number.parseFloat(selectedBetType.multiplier.replace('x', ''))) - Number.parseFloat(betAmount)).toFixed(2) : '0.00'}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Remaining balance:</span>
                          <span className={`font-medium ${balance - Number.parseFloat(betAmount) < 0 ? 'text-red-500' : 'text-foreground'}`}>
                            ${(balance - Number.parseFloat(betAmount)).toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === "bet-history" ? (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">Bet History</h3>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab(null)} className="text-foreground">
                Close
              </Button>
            </div>
            <div className="text-center py-8 text-muted-foreground">
              <p>No bet history yet</p>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">Draw History</h3>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab(null)} className="text-foreground">
                Close
              </Button>
            </div>
            <div className="text-center py-8 text-muted-foreground">
              <p>No draw history yet</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
