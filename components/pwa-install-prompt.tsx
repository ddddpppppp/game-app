"use client"

import { useState, useEffect } from "react"
import { X, Download, Smartphone, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  // 监听外部触发的安装提示事件
  useEffect(() => {
    const handleShowPWAPrompt = () => {
      setShowInstallPrompt(true)
    }

    window.addEventListener('show-pwa-prompt', handleShowPWAPrompt)
    return () => {
      window.removeEventListener('show-pwa-prompt', handleShowPWAPrompt)
    }
  }, [])

  useEffect(() => {
    // 检测iOS设备
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(ios)

    // 检测是否已安装(standalone模式)
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    setIsStandalone(standalone)

    // 监听PWA安装事件
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // 检查是否已经显示过提示(使用localStorage)
      const hasShownPrompt = localStorage.getItem('pwa-install-prompt-shown')
      if (!hasShownPrompt && !standalone) {
        setShowInstallPrompt(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // iOS设备特殊处理
    if (ios && !standalone) {
      const hasShownPrompt = localStorage.getItem('pwa-install-prompt-shown')
      if (!hasShownPrompt) {
        // 延迟一秒显示提示，让用户先看到主要内容
        setTimeout(() => setShowInstallPrompt(true), 1000)
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      setIsInstalling(true)
      try {
        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        
        if (outcome === 'accepted') {
          console.log('User accepted PWA installation')
        } else {
          console.log('User dismissed PWA installation')
        }
        
        setDeferredPrompt(null)
        setShowInstallPrompt(false)
        localStorage.setItem('pwa-install-prompt-shown', 'true')
      } catch (error) {
        console.error('PWA installation failed:', error)
      } finally {
        setIsInstalling(false)
      }
    }
  }

  const handleClose = () => {
    setShowInstallPrompt(false)
    localStorage.setItem('pwa-install-prompt-shown', 'true')
  }

  if (!showInstallPrompt || isStandalone) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 transform transition-transform duration-300 ease-in-out">
      <div className="relative bg-white/20 backdrop-blur-md border-b border-gray-200/30 text-gray-800 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-white/10"></div>
        <div className="relative px-4 py-4 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-2 rounded-lg bg-gray-800/10 backdrop-blur border border-gray-300/20 flex-shrink-0">
                  <Smartphone className="h-5 w-5 text-gray-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-800">
                    Install Keno Canada28 App
                  </h3>
                  <p className="text-xs text-gray-600 truncate">
                    {isIOS 
                      ? "Tap share button, then 'Add to Home Screen'" 
                      : "Get faster access and offline features"
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 ml-2 sm:ml-4 sm:gap-2">
                {!isIOS && (
                  <Button 
                    onClick={handleInstallClick}
                    size="sm" 
                    variant="secondary"
                    className="text-xs font-medium px-2 sm:px-4 py-2 h-auto bg-gray-800/10 hover:bg-gray-800/15 text-gray-800 border border-gray-300/30 backdrop-blur-sm rounded-lg shadow-sm whitespace-nowrap min-w-0"
                    disabled={!deferredPrompt || isInstalling}
                  >
                    {isInstalling ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span className="ml-1 hidden min-[400px]:inline">Installing...</span>
                        <span className="ml-1 min-[400px]:hidden">...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-3 w-3" />
                        <span className="ml-1 hidden min-[380px]:inline">Install</span>
                      </>
                    )}
                  </Button>
                )}
                
                <X className="h-3 w-3 ml-2" onClick={handleClose}/>
              </div>
            </div>
            
            {/* iOS特殊说明 */}
            {isIOS && (
              <div className="mt-3 pt-3 border-t border-gray-200/30">
                <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-600 overflow-x-auto pb-1">
                  <span className="whitespace-nowrap flex-shrink-0">In Safari:</span>
                  <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-800/10 rounded text-gray-700 backdrop-blur-sm border border-gray-300/30 whitespace-nowrap flex-shrink-0">
                    <span className="hidden min-[380px]:inline">Share</span> <span className="text-sm">⬆️</span>
                  </span>
                  <span className="flex-shrink-0">→</span>
                  <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-800/10 rounded text-gray-700 backdrop-blur-sm border border-gray-300/30 whitespace-nowrap flex-shrink-0">
                    <span className="hidden min-[380px]:inline">Add to </span>Home Screen
                  </span>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}
