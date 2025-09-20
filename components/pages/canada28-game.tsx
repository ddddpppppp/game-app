"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Bot, User, ArrowLeft, HelpCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { useProfile } from "@/hooks/use-profile"
import {
  gameService,
  type BetType,
  type GameData,
  type GroupMessage,
  type DrawHistory,
  type BetHistory,
} from "@/lib/services/game"
import { TimeUtils } from "@/lib/utils/time"
import { WebSocketManager } from "@/lib/utils/websocket"
import { GameIntroDialog, shouldShowGameIntro } from "@/components/game-intro-dialog"

// 投注分类
const betCategories = [
  { id: "basic", name: "Basic Bets", icon: "🎯" },
  { id: "combination", name: "Combination Bets", icon: "🎲" },
  { id: "special", name: "Special Bets", icon: "⭐" },
  { id: "sum", name: "The Sum", icon: "🔢" },
]

const baseQuickAmounts = [1, 5, 10, 50, 100]

// 倍数级别：1, 2, 4, 8, 16, 32, 64
const multiplierLevels = [1, 2, 4, 8, 16, 32, 64]

// 从本地存储获取倍数级别索引
const getStoredMultiplierIndex = () => {
  if (typeof window === 'undefined') return 0
  const stored = localStorage.getItem('canada28-multiplier-index')
  const index = stored ? Number.parseInt(stored) : 0
  return Math.max(0, Math.min(multiplierLevels.length - 1, index)) // 确保在0-7范围内
}

// 保存倍数级别索引到本地存储
const saveMultiplierIndex = (index: number) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('canada28-multiplier-index', index.toString())
  }
}

// 生成随机数字
const generateRandomNumbers = () => {
  return Array.from({ length: 3 }, () => Math.floor(Math.random() * 10).toString())
}

export function Canada28Game() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { user, refreshUserInfo } = useProfile()

  // 滚动容器ref
  const messagesScrollRef = useRef<HTMLDivElement>(null)

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
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [showGameIntro, setShowGameIntro] = useState(false)
  const [activeTab, setActiveTab] = useState<"bet" | "bet-history" | "draw-history" | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [multiplierIndex, setMultiplierIndex] = useState(0)
  const [quickAmounts, setQuickAmounts] = useState(baseQuickAmounts)

  // 计时器状态
  const [timeLeft, setTimeLeft] = useState(0)
  const [isDrawing, setIsDrawing] = useState(false)

  // WebSocket状态
  const [wsManager, setWsManager] = useState<WebSocketManager | null>(null)
  const [wsConnected, setWsConnected] = useState(false)
  const [wsReconnecting, setWsReconnecting] = useState(false)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)

  // 开奖结果状态
  const [lastDrawNumbers, setLastDrawNumbers] = useState<string[]>(["", "", ""])
  const [lastDrawSum, setLastDrawSum] = useState<number>(0)

  // 新增的动画状态
  const [animatingNumbers, setAnimatingNumbers] = useState<string[]>(["", "", ""])
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // 倒计时提醒状态
  const [isTimeWarning, setIsTimeWarning] = useState(false)
  const [isTimeCritical, setIsTimeCritical] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)

  const { toast } = useToast()
  
  // 初始化音频上下文（减少延迟）
  const initAudioContext = () => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      } catch (error) {
        console.warn('Audio context creation failed:', error)
      }
    }
  }

  // 播放警告声音（优化版本）
  const playWarningSound = () => {
    try {
      if (!audioContextRef.current) {
        initAudioContext()
      }
      
      const audioContext = audioContextRef.current
      if (!audioContext) return

      // 如果音频上下文被挂起，恢复它
      if (audioContext.state === 'suspended') {
        audioContext.resume()
      }

      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime) // 800Hz 提示音
      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime) // 稍微增加音量
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15) // 缩短时间
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.15) // 更短的声音
    } catch (error) {
      console.warn('Audio playback failed:', error)
    }
  }
  
  // 获取用户余额，提供默认值防止未加载时报错
  const balance = isAuthenticated && user ? user.balance : 0

  // 滚动到消息底部
  const scrollToBottom = () => {
    if (messagesScrollRef.current) {
      messagesScrollRef.current.scrollTop = messagesScrollRef.current.scrollHeight
    }
    // 控制浏览器默认的body滚动
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      })
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
      console.error("Failed to fetch game data:", error)
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
      console.error("Failed to fetch messages:", error)
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      })
    }
  }

  const fetchDrawHistory = async (page = 1, append = false) => {
    try {
      setDrawHistoryLoading(true)
      const data = await gameService.getCanada28DrawHistory(page)

      if (append) {
        setDrawHistory((prev) => [...prev, ...data.draws])
      } else {
        setDrawHistory(data.draws)
      }

      setDrawHistoryPage(page)
      setDrawHistoryHasMore(data.has_more)

      // 返回数据供其他地方使用
      return data
    } catch (error) {
      console.error("Failed to fetch draw history:", error)
      toast({
        title: "Error",
        description: "Failed to load draw history",
        variant: "destructive",
      })
      return null
    } finally {
      setDrawHistoryLoading(false)
    }
  }

  const handleLoadMoreHistory = () => {
    if (drawHistoryHasMore && !drawHistoryLoading) {
      fetchDrawHistory(drawHistoryPage + 1, true)
    }
  }

  const fetchBetHistory = async (page = 1, append = false) => {
    try {
      setBetHistoryLoading(true)
      const data = await gameService.getCanada28BetHistory(page)

      if (append) {
        setBetHistory((prev) => [...prev, ...data.bets])
      } else {
        setBetHistory(data.bets)
      }

      setBetHistoryPage(page)
      setBetHistoryHasMore(data.has_more)
    } catch (error) {
      console.error("Failed to fetch bet history:", error)
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
          console.log("WebSocket 连接成功")
          setWsConnected(true)
        },
        onDisconnect: () => {
          console.log("WebSocket 连接断开")
          setWsConnected(false)
        },
        onError: (error) => {
          console.error("WebSocket 错误:", error)
          setWsConnected(false)
        },
        onMessage: (data) => {
          console.log("收到WebSocket消息:", data)
          handleWebSocketMessage(data)
        },
      })

      setWsManager(manager)

      // 建立连接，添加认证头
      await manager.connect()
    } catch (error) {
      console.error("初始化WebSocket失败:", error)
    }
  }

  // 处理WebSocket消息
  const handleWebSocketMessage = (data: any) => {
    switch (data.action) {
      case "new_message":
        // 收到新的聊天消息，直接添加到消息列表
        if (data.data) {
          setMessages((prev) => [...prev, data.data])
        }
        break
      case "draw_result":
        // 收到开奖结果
        if (data.data) {
          // 将新的开奖结果设置为上期结果
          setLastDrawNumbers(data.data.result_numbers.map((n: any) => n.toString()))
          setLastDrawSum(data.data.result_sum)
          // 刷新游戏数据，重置倒计时，防止重复触发
          fetchGameData(true)
        }
        break
      default:
        console.log("未处理的WebSocket消息类型:", data.action)
    }
  }

  // 初始化倍数从本地存储
  useEffect(() => {
    const storedIndex = getStoredMultiplierIndex()
    setMultiplierIndex(storedIndex)
    const multiplier = multiplierLevels[storedIndex]
    setQuickAmounts(baseQuickAmounts.map(amount => amount * multiplier))
  }, [])

  // 初始化游戏数据和消息
  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([fetchGameData(), fetchMessages()])

        // 获取历史记录来初始化上期开奖号码
        const historyData = await fetchDrawHistory(1)
        if (historyData && historyData.draws && historyData.draws.length > 0) {
          const lastDraw = historyData.draws[0]
          setLastDrawNumbers(lastDraw.result_numbers.map((n) => n.toString()) || ["", "", ""])
          setLastDrawSum(lastDraw.result_sum || 0)
        }

        // 数据加载完成后初始化WebSocket
        initializeWebSocket()
        
        // 预初始化音频上下文（在用户交互后）
        const handleFirstInteraction = () => {
          initAudioContext()
          document.removeEventListener('click', handleFirstInteraction)
          document.removeEventListener('touchstart', handleFirstInteraction)
        }
        document.addEventListener('click', handleFirstInteraction)
        document.addEventListener('touchstart', handleFirstInteraction)
        
        // 初始化完成后滚动到底部
        setTimeout(() => {
          scrollToBottom()
        }, 500)

        // 检查是否需要显示游戏介绍
        if (shouldShowGameIntro()) {
          setShowGameIntro(true)
        }
      } catch (error) {
        console.error("Failed to initialize data:", error)
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
            return true
          }
          return currentIsDrawing
        })
        
        // 倒计时提醒逻辑
        if (prev === 33 || prev === 6 || prev === 5 || prev === 4) {
          playWarningSound()
        }
        if (prev === 31) {
          // 30秒警告 - 立即触发
          setIsTimeWarning(true)
          setTimeout(() => setIsTimeWarning(false), 1000)
        } else if (prev <= 4 && prev > 0) {
          // 最后3秒严重警告 - 立即触发
          setIsTimeCritical(true)
          setTimeout(() => setIsTimeCritical(false), 800)
        }
        
        if (prev > 0) {
          return prev - 1
        } else {
          return 210
        }
      })
    }, 1000)

    return () => {
      console.log("清理倒计时器")
      if (timer) {
        clearInterval(timer)
      }
    }
  }, [gameData])

  // 开始数字动画当抽奖开始时
  useEffect(() => {
    if (isDrawing) {
      // 开始随机数字动画
      animationIntervalRef.current = setInterval(() => {
        setAnimatingNumbers(generateRandomNumbers())
      }, 100) // 每100毫秒更新一次以实现平滑动画
    } else {
      // 抽奖未开始时停止动画
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current)
        animationIntervalRef.current = null
      }
    }

    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current)
      }
    }
  }, [isDrawing])

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
    if (messages.length <= 51) {
      const timer = setTimeout(() => {
        scrollToBottom()
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [messages])

  const handleBack = () => {
    router.back()
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

      // 刷新用户信息以更新余额（仅当已登录时）
      if (isAuthenticated) {
        refreshUserInfo().catch(console.error)
      }

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
      console.error("Failed to place bet:", error)
      toast({
        title: "Bet Failed",
        description: error.message || "Failed to place bet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setBetting(false)
    }
  }

  if (loading) {
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

  const currentPeriod = gameData.current_draw?.period_number || "N/A"

  return (
    <div className="min-h-screen bg-background relative rounded-b-lg overflow-hidden">
      <style jsx>{`
        @keyframes spin-slot {
          0% { transform: translateY(0); }
          100% { transform: translateY(-640px); }
        }
        .animate-spin-slot {
          animation: spin-slot 1.2s linear infinite;
        }

      `}</style>
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-4 z-30 shadow-lg rounded-b-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-foreground hover:bg-primary-foreground/20 p-1"
                onClick={() => router.push("/")}
              >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Canada 28</h1>
              <div className="text-sm opacity-90">Period {currentPeriod}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm opacity-90">{isDrawing ? "Drawing" : "Next Draw"}</span>
            <div className="flex gap-1">
              {TimeUtils.formatCountdown(timeLeft)
                .split(":")
                .map((part, index) => (
                  <div
                    key={index}
                    className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                      isTimeCritical 
                        ? "bg-red-500 text-white animate-pulse" 
                        : isTimeWarning 
                        ? "bg-orange-400 text-white animate-pulse" 
                        : "bg-primary-foreground/20"
                    }`}
                  >
                    {isDrawing ? "--" : part}
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-3 mt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm opacity-90">
                Period {currentPeriod ? (Number.parseInt(currentPeriod) - 1).toString() : ""}
              </span>
              <div className="flex gap-2 ml-3">
                {lastDrawNumbers.map((number, index) => (
                  <div
                    key={index}
                    className="relative w-8 h-8 bg-white rounded shadow-md border border-white/20 overflow-hidden"
                  >
                    {/* 老虎机滚动容器 */}
                    <div
                      className={`absolute inset-0 flex flex-col items-center justify-start ${
                        isDrawing ? "animate-spin-slot" : ""
                      }`}
                    >
                      {/* 显示数字0-9的循环滚动列表 */}
                      {[...Array(20)].map((_, digitIndex) => (
                        <div
                          key={digitIndex}
                          className="w-8 h-8 flex items-center justify-center text-sm font-bold text-gray-800 flex-shrink-0"
                        >
                          {isDrawing ? digitIndex % 10 : number}
                        </div>
                      ))}
                    </div>
                    {/* 当前显示的数字（停止时） */}
                    {!isDrawing && (
                      <div className="absolute inset-0 w-8 h-8 flex items-center justify-center text-sm font-bold text-gray-800 bg-white">
                        {number}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold">=</span>
                <div
                                     className="w-9 h-9 flex items-center justify-center ml-1 rounded-full shadow-md border border-purple-200/40 bg-gradient-to-br from-purple-300 to-purple-400 relative overflow-hidden"
                  style={{
                    filter: "none",
                  }}
                >
                  {isDrawing ? (
                    <div className="animate-pulse">
                      <span className="text-sm font-bold text-white">
                        {Math.floor(Math.random() * 28)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm font-bold text-white">
                      {lastDrawSum}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {/* <div className="w-6 h-6 flex items-center justify-center">
              <svg className="w-4 h-4 opacity-70" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div> */}
          </div>
        </div>

        {(timeLeft <= 30 || isDrawing) && (
          <div className="mt-2 bg-red-500/20 border border-red-400/30 rounded-lg p-2 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">
                {isDrawing ? "Stop Betting - Drawing in Progress" : "Stop Betting - 30s Before Draw"}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="pt-32">
        {/* Messages Container */}
        <div ref={messagesScrollRef} className="h-[calc(100vh)] overflow-y-auto px-4 py-2 space-y-2">
          <div className="space-y-4">
            {messages.map((message) => {
              const isMyMessage = isAuthenticated && user ? gameService.isMyMessage(message, user.uuid) : false
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
                          src={message.avatar || "/placeholder.svg"}
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
                      <p className="text-xs opacity-70 mt-1">{TimeUtils.formatMessageTime(message.created_at)}</p>
                    </div>
                  </div>
                </div>
              )
            })}
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
                onClick={() => {
                  if (!isAuthenticated) {
                    setShowLoginDialog(true)
                  } else {
                    setActiveTab("bet")
                  }
                }}
              >
                Bet
              </Button>
              <Button
                variant="outline"
                className="h-12 bg-card text-foreground hover:bg-accent hover:text-accent-foreground"
                onClick={() => {
                  if (!isAuthenticated) {
                    setShowLoginDialog(true)
                  } else {
                    setActiveTab("bet-history")
                  }
                }}
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
                          <span className="text-xs text-muted-foreground mt-1">{gameService.formatOdds(bet.odds)}</span>
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
                          <span className="text-xs text-muted-foreground mt-1">{gameService.formatOdds(bet.odds)}</span>
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
                          <span className="text-xs text-muted-foreground mt-1">{gameService.formatOdds(bet.odds)}</span>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                    className="text-foreground"
                  >
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
                        <span className="text-xs text-muted-foreground mt-1">{gameService.formatOdds(bet.odds)}</span>
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
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">
                        Multiplier: {selectedBetType ? gameService.formatOdds(selectedBetType.odds) : ""}
                      </p>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newIndex = Math.min(multiplierLevels.length - 1, multiplierIndex + 1)
                            if (newIndex !== multiplierIndex) {
                              setMultiplierIndex(newIndex)
                              const newMultiplier = multiplierLevels[newIndex]
                              setQuickAmounts(baseQuickAmounts.map(amount => amount * newMultiplier))
                              saveMultiplierIndex(newIndex)
                              // 更新当前投注金额
                              const currentAmount = Number.parseFloat(betAmount) || 0
                              if (currentAmount > 0) {
                                setBetAmount((currentAmount * 2).toString())
                              }
                            }
                          }}
                          disabled={multiplierIndex >= multiplierLevels.length - 1}
                          className="h-6 w-6 p-0 text-xs rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 disabled:opacity-50"
                        >
                          ×
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newIndex = Math.max(0, multiplierIndex - 1)
                            if (newIndex !== multiplierIndex) {
                              setMultiplierIndex(newIndex)
                              const newMultiplier = multiplierLevels[newIndex]
                              setQuickAmounts(baseQuickAmounts.map(amount => amount * newMultiplier))
                              saveMultiplierIndex(newIndex)
                              // 更新当前投注金额
                              const currentAmount = Number.parseFloat(betAmount) || 0
                              if (currentAmount > 0) {
                                setBetAmount(Math.max(1, currentAmount / 2).toString())
                              }
                            }
                          }}
                          disabled={multiplierIndex <= 0}
                          className="h-6 w-6 p-0 text-xs rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-600 disabled:opacity-50"
                        >
                          ÷
                        </Button>
                      </div>
                    </div>
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
                    <Button onClick={handlePlaceBet} className="px-6" disabled={isDrawing || betting || !canPlaceBet()}>
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
                              $
                              {gameService
                                .calculatePotentialWinnings(Number.parseFloat(betAmount), selectedBetType.odds)
                                .toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                            <span>Your bet: ${Number.parseFloat(betAmount).toFixed(2)}</span>
                            <span>
                              Profit: $
                              {gameService
                                .calculateProfit(Number.parseFloat(betAmount), selectedBetType.odds)
                                .toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Remaining balance:</span>
                          <span
                            className={`font-medium ${balance - Number.parseFloat(betAmount) < 0 ? "text-red-500" : "text-foreground"}`}
                          >
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

                      {bet.status !== "pending" && (
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
                      className="w-full bg-transparent"
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
                      <span className="text-xs text-muted-foreground">{TimeUtils.formatMessageTime(draw.draw_at)}</span>
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
                      className="w-full bg-transparent"
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

      {/* 登录对话框 */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="max-w-[90vw] w-full max-h-[80vh] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You need to log in to access betting features and view your history.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setShowLoginDialog(false)
                  router.push("/login")
                }}
                className="flex-1"
              >
                Sign In
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowLoginDialog(false)
                  router.push("/register")
                }}
                className="flex-1"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 固定帮助按钮 */}
      <Button
        variant="outline"
        size="sm"
        className="fixed right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 p-0 rounded-full bg-background/80 backdrop-blur-sm border-border shadow-lg hover:bg-accent hover:text-accent-foreground"
        onClick={() => setShowGameIntro(true)}
      >
        <HelpCircle className="w-5 h-5" />
      </Button>

      {/* 游戏介绍对话框 */}
      <GameIntroDialog 
        open={showGameIntro} 
        onOpenChange={setShowGameIntro} 
      />
    </div>
  )
}
