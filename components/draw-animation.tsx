"use client"

import { useState, useEffect } from "react"

interface DrawAnimationProps {
  isVisible: boolean
  isDrawing: boolean
  resultNumbers?: string[]
  resultSum?: number
  onComplete?: () => void
}

export function DrawAnimation({ 
  isVisible, 
  isDrawing, 
  resultNumbers, 
  resultSum, 
  onComplete 
}: DrawAnimationProps) {
  const [displayNumbers, setDisplayNumbers] = useState<string[]>(["0", "0", "0"])
  const [showResult, setShowResult] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // 生成随机数字用于滚动效果
  const generateRandomNumbers = () => {
    return Array.from({ length: 3 }, () => Math.floor(Math.random() * 10).toString())
  }

  useEffect(() => {
    
    let interval: NodeJS.Timeout | null = null
    let resultTimeout: NodeJS.Timeout | null = null
    let closeTimeout: NodeJS.Timeout | null = null

    if (isDrawing && !resultNumbers) {
      // 开始滚动动画
      setShowResult(false)
      setIsAnimating(true)
      interval = setInterval(() => {
        setDisplayNumbers(generateRandomNumbers())
      }, 100) // 每100ms更新一次数字
    } else if (resultNumbers && !isDrawing) {
      // 停止滚动，显示结果
      setDisplayNumbers(resultNumbers)
      setIsAnimating(false)
      
      // 延迟显示结果
      resultTimeout = setTimeout(() => {
        setShowResult(true)
      }, 500)

      // 5秒后自动关闭
      closeTimeout = setTimeout(() => {
        if (onComplete) {
          onComplete()
        }
      }, 5500) // 增加500ms延迟确保结果先显示
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
      if (resultTimeout) {
        clearTimeout(resultTimeout)
      }
      if (closeTimeout) {
        clearTimeout(closeTimeout)
      }
    }
  }, [isDrawing, resultNumbers, onComplete])

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-2xl p-8 shadow-2xl border-4 border-yellow-300 animate-scale-in relative overflow-hidden">
        <div className="text-center relative z-10">
          {/* 标题 */}
          <h2 className="text-3xl font-bold text-white mb-8 drop-shadow-lg animate-slide-down">
            {isDrawing ? "Drawing..." : "Draw Result"}
          </h2>

          {/* 数字显示区域 */}
          <div className="flex justify-center gap-4 mb-8">
            {displayNumbers.map((number, index) => (
              <div
                key={index}
                className={`relative ${isDrawing ? 'animate-slot-spin' : 'animate-bounce-in'}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-20 h-24 bg-white rounded-xl shadow-lg flex items-center justify-center border-4 border-gray-200 transition-all duration-300">
                  <span
                    key={`${index}-${number}`}
                    className="text-4xl font-bold text-gray-800 animate-number-flip"
                  >
                    {number}
                  </span>
                </div>
                
                {/* 发光效果 */}
                {!isDrawing && showResult && (
                  <div className="absolute inset-0 bg-yellow-300/30 rounded-xl blur-sm animate-glow" />
                )}
              </div>
            ))}
          </div>

          {/* 总和显示 */}
          {showResult && resultSum !== undefined && (
            <div className="mb-6 animate-slide-up">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                <p className="text-white text-lg font-semibold mb-2">Total Sum</p>
                <div className="w-16 h-16 bg-white rounded-full mx-auto flex items-center justify-center shadow-lg animate-scale-bounce">
                  <span className="text-3xl font-bold text-yellow-600">{resultSum}</span>
                </div>
              </div>
            </div>
          )}

          {/* 状态文本 */}
          <div className={isDrawing ? 'animate-pulse' : ''}>
            {isDrawing ? (
              <p className="text-white text-lg font-medium">
                Numbers are being drawn...
              </p>
            ) : showResult ? (
              <div className="animate-fade-in-delayed">
                {/* <p className="text-white text-lg font-medium mb-2">
                  Congratulations! 🎉
                </p> */}
                <p className="text-white/80 text-sm">
                  This window will close automatically in 5 seconds
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {/* 装饰元素 */}
        <div className="absolute top-4 left-4 w-6 h-6 bg-white/20 rounded-full animate-pulse" />
        <div className="absolute top-6 right-6 w-4 h-4 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-4 left-6 w-5 h-5 bg-white/25 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-6 right-4 w-3 h-3 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />

        {/* 背景动画效果 */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scale-in {
          from { 
            opacity: 0; 
            transform: scale(0.5); 
          }
          to { 
            opacity: 1; 
            transform: scale(1); 
          }
        }
        
        @keyframes slide-down {
          from { 
            opacity: 0; 
            transform: translateY(-20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes slide-up {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes bounce-in {
          0% { 
            opacity: 0; 
            transform: scale(0.3); 
          }
          50% { 
            transform: scale(1.1); 
          }
          100% { 
            opacity: 1; 
            transform: scale(1); 
          }
        }
        
        @keyframes slot-spin {
          0% { transform: rotateY(0deg) scale(1); }
          50% { transform: rotateY(180deg) scale(1.1); }
          100% { transform: rotateY(360deg) scale(1); }
        }
        
        @keyframes number-flip {
          0% { 
            opacity: 0; 
            transform: translateY(10px); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes scale-bounce {
          0% { 
            transform: scale(0); 
          }
          70% { 
            transform: scale(1.1); 
          }
          100% { 
            transform: scale(1); 
          }
        }
        
        @keyframes glow {
          0%, 100% { 
            opacity: 0; 
            transform: scale(0.8); 
          }
          50% { 
            opacity: 1; 
            transform: scale(1.2); 
          }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes fade-in-delayed {
          0% { 
            opacity: 0; 
            transform: translateY(10px); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .animate-slide-down {
          animation: slide-down 0.5s ease-out 0.2s both;
        }
        
        .animate-slide-up {
          animation: slide-up 0.5s ease-out 0.5s both;
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .animate-slot-spin {
          animation: slot-spin 0.3s ease-in-out infinite;
        }
        
        .animate-number-flip {
          animation: number-flip 0.2s ease-out;
        }
        
        .animate-scale-bounce {
          animation: scale-bounce 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.7s both;
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
        
        .animate-fade-in-delayed {
          animation: fade-in-delayed 0.5s ease-out 1s both;
        }
      `}</style>
    </div>
  )
} 