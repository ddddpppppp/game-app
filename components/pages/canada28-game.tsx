"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Info, Bot, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useProfile } from "@/hooks/use-profile"
import { gameService, type BetType, type GameData, type CurrentDraw, type GroupMessage, type DrawHistory, type BetHistory } from "@/lib/services/game"
import { TimeUtils } from "@/lib/utils/time"
import { WebSocketManager } from "@/lib/utils/websocket"
import { DrawAnimation } from "@/components/draw-animation"

// 投注分类
const betCategories = [
  { id: "basic", name: "Basic Bets", icon: "🎯" },
  { id: "combination", name: "Combination Bets", icon: "🎲" },
  { id: "special", name: "Special Bets", icon: "⭐" },
  { id: "sum", name: "The Sum", icon: "🔢" },
]

const quickAmounts = [10, 50, 100, 500, 1000]

export function Canada28Game() {
  const router = useRouter()
  const { user, refreshUserInfo } = useProfile()

  // 滚动容器ref
  const messagesScrollRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // API数据状态
  const [gameData, setGameData] = useState<GameData | null>(null)
  const [messages, setMessages] = useState<GroupMessage[]>([])
  const [drawHistory, setDrawHistory] = useState<DrawHistory[]>([])
  const [drawHistoryPage, setDrawHistoryPage] = useState(1)
  const [drawHistoryHasMore, setDrawHistoryHasMore] = useState(true)
  const [drawHistoryLoading, setDrawHistoryLoading] = useState(false)
  const [betHistory, setBetHistory] = useState<BetHistory[]>([])
  const [betHistoryPage, setBetHistoryPage] = useState(1)
  const [betHistoryHasMore, setBetHistoryHasMore] = useState(true)
  const [betHistoryLoading, setBetHistoryLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false) // 刷新状态，不阻塞UI
  const [betting, setBetting] = useState(false) // 投注状态
  const [selectedBetType, setSelectedBetType] = useState<BetType | null>(null)
  const [betAmount, setBetAmount] = useState("")
  const [showRules, setShowRules] = useState(false)
  const [activeTab, setActiveTab] = useState<"bet" | "bet-history" | "draw-history" | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  
  // 计时器状态
  const [timeLeft, setTimeLeft] = useState(0)
  const [isDrawing, setIsDrawing] = useState(false)
  
  // WebSocket状态
  const [wsManager, setWsManager] = useState<WebSocketManager | null>(null)
  const [wsConnected, setWsConnected] = useState(false)
  const [wsReconnecting, setWsReconnecting] = useState(false)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  
  // 开奖动画状态
  const [showDrawAnimation, setShowDrawAnimation] = useState(false)
  const [drawResult, setDrawResult] = useState<{
    numbers: string[]
    sum: number
  } | null>(null)
  
  const { toast } = useToast()
  
  // 获取用户余额，提供默认值防止未加载时报错
  const balance = user?.balance || 0

  // 滚动到消息底部
  const scrollToBottom = () => {
    // 方法1：滚动到底部元素（推荐）
    // if (messagesEndRef.current) {
    //   messagesEndRef.current.scrollIntoView({ 
    //     behavior: 'smooth',
    //     block: 'end'
    //   })
    // }
    
    // 方法2：直接设置scrollTop作为备选
    if (messagesScrollRef.current) {
      messagesScrollRef.current.scrollTop = messagesScrollRef.current.scrollHeight
    }
  }

    const fetchGameData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      
      const data = await gameService.getCanada28Game()
      
      // 设置倒计时（使用本地时间计算）
      if (data.current_draw) {
        setIsDrawing(false)
        const calculatedTimeLeft = TimeUtils.calculateTimeLeft(data.current_draw.end_at)
        setTimeLeft(calculatedTimeLeft)
        setIsDrawing(data.current_draw.status === 1) // 1表示开奖中
        setGameData(data)
      }
    } catch (error) {
      console.error('Failed to fetch game data:', error)
      if (!isRefresh) {
        // 只在初始加载时显示错误toast，刷新时静默处理
        toast({
          title: "Error",
          description: "Failed to load game data",
          variant: "destructive",
        })
      }
    } finally {
      if (isRefresh) {
        setRefreshing(false)
      } else {
        setLoading(false)
      }
    }
  }

  const fetchMessages = async () => {
    try {
      const data = await gameService.getCanada28Messages()
      setMessages(data.messages)
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      })
    }
  }

  const fetchDrawHistory = async (page: number = 1, append: boolean = false) => {
    try {
      setDrawHistoryLoading(true)
      const data = await gameService.getCanada28DrawHistory(page)
      
      if (append) {
        setDrawHistory(prev => [...prev, ...data.draws])
      } else {
        setDrawHistory(data.draws)
      }
      
      setDrawHistoryPage(page)
      setDrawHistoryHasMore(data.has_more)
    } catch (error) {
      console.error('Failed to fetch draw history:', error)
      toast({
        title: "Error",
        description: "Failed to load draw history",
        variant: "destructive",
      })
    } finally {
      setDrawHistoryLoading(false)
    }
  }

  const handleLoadMoreHistory = () => {
    if (drawHistoryHasMore && !drawHistoryLoading) {
      fetchDrawHistory(drawHistoryPage + 1, true)
    }
  }

  const fetchBetHistory = async (page: number = 1, append: boolean = false) => {
    try {
      setBetHistoryLoading(true)
      const data = await gameService.getCanada28BetHistory(page)
      
      if (append) {
        setBetHistory(prev => [...prev, ...data.bets])
      } else {
        setBetHistory(data.bets)
      }
      
      setBetHistoryPage(page)
      setBetHistoryHasMore(data.has_more)
    } catch (error) {
      console.error('Failed to fetch bet history:', error)
      toast({
        title: "Error",
        description: "Failed to load bet history",
        variant: "destructive",
      })
    } finally {
      setBetHistoryLoading(false)
    }
  }

  const handleLoadMoreBetHistory = () => {
    if (betHistoryHasMore && !betHistoryLoading) {
      fetchBetHistory(betHistoryPage + 1, true)
    }
  }

  // 初始化WebSocket连接
  const initializeWebSocket = async () => {
    
    try {
      const wsUrl = `/game_canada28_ws/connect`

      const manager = new WebSocketManager({
        url: wsUrl,
        onConnect: () => {
          console.log('WebSocket 连接成功')
          setWsConnected(true)
        },
        onDisconnect: () => {
          console.log('WebSocket 连接断开')
          setWsConnected(false)
        },
        onError: (error) => {
          console.error('WebSocket 错误:', error)
          setWsConnected(false)
        },
        onMessage: (data) => {
          console.log('收到WebSocket消息:', data)
          handleWebSocketMessage(data)
        }
      })

      setWsManager(manager)
      
      // 建立连接，添加认证头
      await manager.connect()
      
    } catch (error) {
      console.error('初始化WebSocket失败:', error)
    }
  }

  // 处理WebSocket消息
  const handleWebSocketMessage = (data: any) => {
    switch (data.action) {
      case 'new_message':
        // 收到新的聊天消息，直接添加到消息列表
        if (data.data) {
          setMessages(prev => [...prev, data.data])
        }
        break
      case 'draw_result':
        // 收到开奖结果
        if (data.data) {
          setDrawResult({
            numbers: data.data.result_numbers,
            sum: data.data.result_sum
          })
          // 刷新游戏数据，重置倒计时，防止重复触发
          fetchGameData(true)
        }
        break
      default:
        console.log('未处理的WebSocket消息类型:', data.action)
    }
  }

  // 初始化游戏数据和消息
  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          fetchGameData(),
          fetchMessages()
        ])
        
        // 数据加载完成后初始化WebSocket
        if (user) {
          initializeWebSocket()
        }
      } catch (error) {
        console.error('Failed to initialize data:', error)
      }
    }
    
    initializeData()
  }, [])

  // 当用户切换到开奖历史tab时才加载数据
  useEffect(() => {
    if (activeTab === "draw-history" && drawHistory.length === 0) {
      fetchDrawHistory()
    }
  }, [activeTab])

  // 当用户切换到投注历史tab时才加载数据
  useEffect(() => {
    if (activeTab === "bet-history" && betHistory.length === 0) {
      fetchBetHistory()
    }
  }, [activeTab])

  // 倒计时效果
  useEffect(() => {
    if (!gameData?.current_draw) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        setIsDrawing((currentIsDrawing) => {
          if (prev < 1 && !currentIsDrawing) {
            setShowDrawAnimation(true)
            setDrawResult(null) // 重置开奖结果
            return true
          }
          return currentIsDrawing
        })
        if (prev > 0) {
          return prev - 1
        } else {
          return 210
        }
      })
    }, 1000)

    return () => {
      console.log('清理倒计时器')
      if (timer) {
        clearInterval(timer)
      }
    }
  }, [gameData])

  // 清理WebSocket连接
  useEffect(() => {
    return () => {
      if (wsManager) {
        wsManager.disconnect()
      }
    }
  }, [wsManager])

  // 监听消息变化，自动滚动到底部
  useEffect(() => {
    if (messages.length <= 50) {
      const timer = setTimeout(() => {
        scrollToBottom()
      }, 200)
      
      return () => clearTimeout(timer)
    }
  }, [messages])

  const handleBack = () => {
    router.back()
  }

  // 关闭开奖动画
  const handleDrawAnimationComplete = useCallback(() => {
    setShowDrawAnimation(false)
    setDrawResult(null)
  }, [])

  // 测试开奖结果 (开发环境使用)
  const testDrawResult = () => {
    const testData = {
      result_numbers: ["2", "3", "0"],
      result_sum: 5
    }
    console.log('手动测试开奖结果:', testData)
    setDrawResult({
      numbers: testData.result_numbers,
      sum: testData.result_sum
    })
    setIsDrawing(false)
  }

  // 根据分类获取投注选项
  const getBetsByCategory = (category: string): BetType[] => {
    if (!gameData) return []
    return gameService.getBetTypesByCategory(gameData.bet_types, category)
  }

  // 检查是否可以下注（30秒内停止下注）
  const canPlaceBet = () => {
    return timeLeft > 30 && !isDrawing
  }

  const handlePlaceBet = async () => {
    if (isDrawing) {
      toast({
        title: "Drawing in Progress",
        description: "Please wait for the current draw to complete.",
        variant: "destructive",
      })
      return
    }

    if (timeLeft <= 30) {
      toast({
        title: "Betting Closed",
        description: "Betting is closed 30 seconds before the draw.",
        variant: "destructive",
      })
      return
    }

    if (betting) {
      toast({
        title: "Betting in Progress",
        description: "Please wait for the current bet to complete.",
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

    try {
      setBetting(true)
      
      // 调用投注API
      const result = await gameService.placeCanada28Bet(selectedBetType.id, amount)
      
      // 刷新用户信息以更新余额
      refreshUserInfo().catch(console.error)

      // 如果当前在投注历史页面，刷新投注历史
      if (activeTab === "bet-history") {
        fetchBetHistory()
      }

      // Reset bet selection
      setSelectedBetType(null)
      setBetAmount("")
      if (selectedCategory === "sum") {
        setSelectedCategory(null)
      }

      toast({
        title: "Bet Placed Successfully!",
        description: result.message,
      })

    } catch (error: any) {
      console.error('Failed to place bet:', error)
      toast({
        title: "Bet Failed",
        description: error.message || "Failed to place bet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setBetting(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading game data...</p>
        </div>
      </div>
    )
  }

  if (!gameData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load game data</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
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
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-foreground">
                  Keno #{gameData.current_draw?.period_number || 'N/A'}
                </h1>
                {refreshing && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                {isDrawing ? (
                  <span className="text-orange-500 font-medium">Drawing...</span>
                ) : (
                  <>
                    <span className="text-muted-foreground">Current draw:</span>
                    <span className="font-mono font-semibold text-blue-600">{TimeUtils.formatCountdown(timeLeft)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden pb-0">
        <div 
          ref={messagesScrollRef}
          className="h-full px-4 py-4 overflow-y-auto scroll-smooth"
          style={{ maxHeight: 'calc(100vh)' }}
        >
          <div className="space-y-4">
            {messages.map((message) => {
              const isMyMessage = gameService.isMyMessage(message, user?.uuid || '')
              const isBotMessage = gameService.isBotMessage(message)
              
              return (
                <div
                  key={message.id || `${message.user_id}-${message.created_at}-${message.message.slice(0, 10)}`}
                  className={`flex gap-3 ${isMyMessage ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex gap-2 max-w-[75%] sm:max-w-[80%] ${isMyMessage ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isMyMessage ? "bg-accent" : "bg-muted"
                      }`}
                    >
                      {isBotMessage ? (
                        <Bot className="w-4 h-4" />
                      ) : message.avatar ? (
                        <img 
                          src={message.avatar} 
                          alt={message.nickname}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>
                    <div
                      className={`rounded-lg px-3 py-2 ${
                        isMyMessage ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {!isBotMessage && !isMyMessage && (
                        <p className="text-xs font-medium mb-1 opacity-70">{message.nickname}</p>
                      )}
                      <p className="text-sm break-words whitespace-pre-line">{message.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {TimeUtils.formatMessageTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
            {/* 底部滚动目标元素 */}
            {/* <div ref={messagesEndRef} /> */}
          </div>
        </div>
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
            {!selectedBetType && !selectedCategory ? (
              <div className="max-h-[60vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground">Place Your Bet</h3>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab(null)} className="text-foreground">
                    Close
                  </Button>
                </div>
                
                {/* Betting Status */}
                {timeLeft <= 30 && !isDrawing && (
                  <div className="mb-4 p-3 bg-orange-100 border border-orange-300 rounded-lg">
                    <p className="text-sm font-medium text-orange-800">
                      🚫 Betting is closed 30 seconds before the draw
                    </p>
                  </div>
                )}
                
                {/* Basic Bets */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-foreground mb-2">Basic Bets</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {getBetsByCategory("basic").map((bet) => {
                      const isEnabled = gameService.isBetTypeEnabled(bet) && canPlaceBet()
                      return (
                        <Button
                          key={bet.id}
                          variant="outline"
                          disabled={!isEnabled}
                          className={`h-auto min-h-[45px] p-2 flex flex-col justify-center items-center text-center ${
                            isEnabled 
                              ? "bg-card text-foreground hover:bg-accent hover:text-accent-foreground" 
                              : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                          }`}
                          onClick={() => {
                            if (isEnabled) {
                              setSelectedBetType(bet)
                            }
                          }}
                        >
                          <span className="font-bold text-xs break-words">{bet.type_name}</span>
                          <span className="text-xs text-muted-foreground mt-1">
                            {gameService.formatOdds(bet.odds)}
                          </span>
                        </Button>
                      )
                    })}
                  </div>
                </div>

                {/* Combination Bets */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-foreground mb-2">Combination Bets</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {getBetsByCategory("combination").map((bet) => {
                      const isEnabled = gameService.isBetTypeEnabled(bet) && canPlaceBet()
                      return (
                        <Button
                          key={bet.id}
                          variant="outline"
                          disabled={!isEnabled}
                          className={`h-auto min-h-[45px] p-2 flex flex-col justify-center items-center text-center ${
                            isEnabled 
                              ? "bg-card text-foreground hover:bg-accent hover:text-accent-foreground" 
                              : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                          }`}
                          onClick={() => {
                            if (isEnabled) {
                              setSelectedBetType(bet)
                            }
                          }}
                        >
                          <span className="font-bold text-xs break-words">{bet.type_name}</span>
                          <span className="text-xs text-muted-foreground mt-1">
                            {gameService.formatOdds(bet.odds)}
                          </span>
                        </Button>
                      )
                    })}
                  </div>
                </div>

                {/* Special Bets */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-foreground mb-2">Special Bets</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {getBetsByCategory("special").map((bet) => {
                      const isEnabled = gameService.isBetTypeEnabled(bet) && canPlaceBet()
                      return (
                        <Button
                          key={bet.id}
                          variant="outline"
                          disabled={!isEnabled}
                          className={`h-auto min-h-[45px] p-2 flex flex-col justify-center items-center text-center ${
                            isEnabled 
                              ? "bg-card text-foreground hover:bg-accent hover:text-accent-foreground" 
                              : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                          }`}
                          onClick={() => {
                            if (isEnabled) {
                              setSelectedBetType(bet)
                            }
                          }}
                        >
                          <span className="font-bold text-xs break-words">{bet.type_name}</span>
                          <span className="text-xs text-muted-foreground mt-1">
                            {gameService.formatOdds(bet.odds)}
                          </span>
                        </Button>
                      )
                    })}
                  </div>
                </div>

                {/* The Sum - 需要点击进入 */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-foreground mb-2">The Sum</h4>
                  <Button
                    variant="outline"
                    disabled={!canPlaceBet()}
                    className={`w-full h-auto min-h-[50px] p-3 flex flex-col justify-center items-center text-center ${
                      canPlaceBet() 
                        ? "bg-card text-foreground hover:bg-accent hover:text-accent-foreground" 
                        : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                    }`}
                    onClick={() => setSelectedCategory("sum")}
                  >
                    <span className="text-2xl mb-1">🔢</span>
                    <span className="font-bold text-xs">Select Sum (0-27)</span>
                  </Button>
                </div>
              </div>
            ) : selectedCategory === "sum" && !selectedBetType ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground">The Sum (0-27)</h3>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(null)} className="text-foreground">
                    Back
                  </Button>
                </div>
                
                <div className="grid grid-cols-4 gap-2 p-2 max-h-80 overflow-y-auto">
                  {getBetsByCategory("sum").map((bet) => {
                    const isEnabled = gameService.isBetTypeEnabled(bet) && canPlaceBet()
                    return (
                      <Button
                        key={bet.id}
                        variant="outline"
                        disabled={!isEnabled}
                        className={`h-auto min-h-[45px] p-2 flex flex-col justify-center items-center text-center ${
                          isEnabled 
                            ? "bg-card text-foreground hover:bg-accent hover:text-accent-foreground" 
                            : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                        }`}
                        onClick={() => isEnabled && setSelectedBetType(bet)}
                      >
                        <span className="font-bold text-xs break-words">{bet.type_name}</span>
                        <span className="text-xs text-muted-foreground mt-1">
                          {gameService.formatOdds(bet.odds)}
                        </span>
                      </Button>
                    )
                  })}
                </div>
              </div>
                        ) : (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{selectedBetType?.type_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Multiplier: {selectedBetType ? gameService.formatOdds(selectedBetType.odds) : ''}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedBetType(null)
                      if (selectedCategory === "sum") {
                        setSelectedCategory(null)
                      }
                    }}
                    className="text-foreground"
                  >
                    Back
                  </Button>
                </div>

                {/* Betting Status */}
                {timeLeft <= 30 && !isDrawing && (
                  <div className="mb-4 p-3 bg-orange-100 border border-orange-300 rounded-lg">
                    <p className="text-sm font-medium text-orange-800">
                      🚫 Betting is closed 30 seconds before the draw
                    </p>
                  </div>
                )}

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
                      disabled={isDrawing || betting || !canPlaceBet()}
                    >
                      {betting ? "Betting..." : isDrawing ? "Drawing..." : timeLeft <= 30 ? "Betting Closed" : "Bet"}
                    </Button>
                  </div>

                  {/* Balance and potential winnings display */}
                  <div className="bg-muted/50 rounded-lg p-3 border space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Current Balance:</span>
                      <span className="font-semibold text-foreground">${balance.toFixed(2)}</span>
                    </div>
                    
                    {betAmount && Number.parseFloat(betAmount) > 0 && selectedBetType && (
                      <>
                        <div className="border-t border-border pt-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Potential Winnings:</span>
                            <span className="font-semibold text-green-600">
                              ${gameService.calculatePotentialWinnings(Number.parseFloat(betAmount), selectedBetType.odds).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                            <span>Your bet: ${Number.parseFloat(betAmount).toFixed(2)}</span>
                            <span>Profit: ${gameService.calculateProfit(Number.parseFloat(betAmount), selectedBetType.odds).toFixed(2)}</span>
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
            
            {betHistory.length === 0 && !betHistoryLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No bet history yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {betHistory.map((bet) => (
                  <div key={bet.id} className="bg-card border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">#{bet.period_number}</span>
                        <Badge className={`text-xs text-white ${gameService.getBetStatusColor(bet.status)}`}>
                          {bet.status_text}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {TimeUtils.formatMessageTime(bet.created_at)}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{bet.bet_type_name}</span>
                        <span className="text-sm text-foreground">${bet.amount.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Multiplier: {gameService.formatOdds(bet.multiplier)}</span>
                        <span>Potential: ${bet.potential_win.toFixed(2)}</span>
                      </div>
                      
                      {bet.status !== 'pending' && (
                        <div className="text-xs text-muted-foreground border-t pt-2">
                          <span>Result: {gameService.getBetResultText(bet)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {betHistoryHasMore && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      onClick={handleLoadMoreBetHistory}
                      disabled={betHistoryLoading}
                      className="w-full"
                    >
                      {betHistoryLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          Loading...
                        </>
                      ) : (
                        "Load More"
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">Draw History</h3>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab(null)} className="text-foreground">
                Close
              </Button>
            </div>
            
            {drawHistory.length === 0 && !drawHistoryLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No draw history yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {drawHistory.map((draw) => (
                  <div key={draw.id} className="bg-card border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">#{draw.period_number}</span>
                        <Badge variant={draw.status === 2 ? "default" : "secondary"} className="text-xs">
                          {draw.status_text}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {TimeUtils.formatMessageTime(draw.draw_at)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {draw.result_numbers.map((number, index) => (
                          <div
                            key={index}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${gameService.getBallColor(number)}`}
                          >
                            {number}
                          </div>
                        ))}
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-foreground">{draw.result_sum}</div>
                        <div className="text-xs text-muted-foreground flex gap-1">
                          <span>{gameService.getSumType(draw.result_sum)}</span>
                          <span>•</span>
                          <span>{gameService.getSumParity(draw.result_sum)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {drawHistoryHasMore && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      onClick={handleLoadMoreHistory}
                      disabled={drawHistoryLoading}
                      className="w-full"
                    >
                      {drawHistoryLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          Loading...
                        </>
                      ) : (
                        "Load More"
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 开奖动画 */}
      <DrawAnimation
        isVisible={showDrawAnimation}
        isDrawing={isDrawing}
        resultNumbers={drawResult?.numbers}
        resultSum={drawResult?.sum}
        onComplete={handleDrawAnimationComplete}
      />
    </div>
  )
}
