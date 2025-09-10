"use client"

import { useState } from "react"
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
  category: string
}

const betTypes: BetType[] = [
  // Basic Bets
  { id: "high", name: "High (14-27)", multiplier: "3.0x", category: "basic" },
  { id: "low", name: "Low (0-13)", multiplier: "3.0x", category: "basic" },
  { id: "odd", name: "Odd", multiplier: "3.0x", category: "basic" },
  { id: "even", name: "Even", multiplier: "3.0x", category: "basic" },

  // Extreme Bets
  { id: "extreme-high", name: "Extreme High (22-27)", multiplier: "10x", category: "extreme" },
  { id: "extreme-low", name: "Extreme Low (0-5)", multiplier: "10x", category: "extreme" },

  // Combination Bets
  { id: "high-odd", name: "High Odd", multiplier: "6.5x", category: "combination" },
  { id: "high-even", name: "High Even", multiplier: "6.5x", category: "combination" },
  { id: "low-odd", name: "Low Odd", multiplier: "6.5x", category: "combination" },
  { id: "low-even", name: "Low Even", multiplier: "6.5x", category: "combination" },

  // Last Digit Bets
  { id: "last-high", name: "Last Digit High", multiplier: "2.4x", category: "last-digit" },
  { id: "last-low", name: "Last Digit Low", multiplier: "2.4x", category: "last-digit" },
  { id: "last-odd", name: "Last Digit Odd", multiplier: "2.4x", category: "last-digit" },
  { id: "last-even", name: "Last Digit Even", multiplier: "2.4x", category: "last-digit" },
  { id: "last-high-odd", name: "Last Digit High Odd", multiplier: "4.8x", category: "last-digit" },
  { id: "last-high-even", name: "Last Digit High Even", multiplier: "4.8x", category: "last-digit" },
  { id: "last-low-odd", name: "Last Digit Low Odd", multiplier: "4.8x", category: "last-digit" },
  { id: "last-low-even", name: "Last Digit Low Even", multiplier: "4.8x", category: "last-digit" },

  // Special Bets
  { id: "triple", name: "Triple", multiplier: "50x", category: "special" },
  { id: "straight", name: "Straight", multiplier: "10x", category: "special" },
  { id: "pair", name: "Pair", multiplier: "3x", category: "special" },
]

const betCategories = [
  { id: "basic", name: "Basic Bets", icon: "🎯" },
  { id: "extreme", name: "Extreme Bets", icon: "⚡" },
  { id: "combination", name: "Combination", icon: "🎲" },
  { id: "last-digit", name: "Last Digit", icon: "🔢" },
  { id: "special", name: "Special Bets", icon: "⭐" },
]

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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedBetType, setSelectedBetType] = useState<BetType | null>(null)
  const [betAmount, setBetAmount] = useState("")
  const [balance] = useState(5000) // Mock balance
  const [showRules, setShowRules] = useState(true)
  const [activeTab, setActiveTab] = useState<"bet" | "bet-history" | "draw-history" | null>(null)
  const { toast } = useToast()

  const handleBack = () => {
    router.back()
  }

  const handlePlaceBet = () => {
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
    setSelectedCategory(null)
    setSelectedBetType(null)
    setBetAmount("")

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
              <h1 className="font-bold text-lg text-foreground">Keno</h1>
              <p className="text-sm text-muted-foreground">Balance: ${balance}</p>
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
                    <h4 className="font-semibold mb-2">1. High / Low</h4>
                    <p>Low: 0–13, High: 14–27</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">2. Odd / Even</h4>
                    <p>Based on whether the total ends with an odd or even digit</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">3. Extreme Bets</h4>
                    <p>Extreme Low: 0–5, Extreme High: 22–27</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">4. Combination Bets</h4>
                    <p>High Even: 14, 16, 18, 20, 22, 24, 26</p>
                    <p>Low Even: 00, 02, 04, 06, 08, 10, 12</p>
                    <p>High Odd: 15, 17, 19, 21, 23, 25, 27</p>
                    <p>Low Odd: 01, 03, 05, 07, 09, 11, 13</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">5. Straight-Up Bet on Number</h4>
                    <p>Select any exact total from 0–27.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">6. Pair</h4>
                    <p>Any two digits are identical (e.g., 011, 010).</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">7. Straight (Sequence)</h4>
                    <p>Three consecutive digits, regardless of order (e.g., 123, 231).</p>
                    <p>Special straights: 890 and 910 also count as sequences.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">8. Triple (Trips / Three of a Kind)</h4>
                    <p>All three digits identical (e.g., 222, 111).</p>
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
                <div className="grid grid-cols-2 gap-2">
                  {betCategories.map((category) => (
                    <Button
                      key={category.id}
                      variant="outline"
                      className="h-auto p-3 bg-card text-foreground hover:bg-accent hover:text-accent-foreground"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <div className="flex items-center gap-2 w-full text-foreground">
                        <span className="text-lg">{category.icon}</span>
                        <span className="font-medium text-sm">{category.name}</span>
                      </div>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                    className="text-foreground"
                  >
                    Back
                  </Button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {betTypes
                    .filter((bet) => bet.category === selectedCategory)
                    .map((bet) => (
                      <Button
                        key={bet.id}
                        variant="outline"
                        className="w-full h-auto p-3 bg-card text-foreground hover:bg-accent hover:text-accent-foreground"
                        onClick={() => setSelectedBetType(bet)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-sm text-foreground">{bet.name}</span>
                          <Badge variant="secondary">{bet.multiplier}</Badge>
                        </div>
                      </Button>
                    ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{selectedBetType.name}</h3>
                    <p className="text-sm text-muted-foreground">Multiplier: {selectedBetType.multiplier}</p>
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
                    <Button onClick={handlePlaceBet} className="px-6">
                      Bet
                    </Button>
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
