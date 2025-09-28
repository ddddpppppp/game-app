"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Download } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { showPWAInstallPrompt, isPWAMode } from "@/lib/utils/pwa-utils"
import Image from "next/image"

interface CarouselItem {
  id: string
  title: string
  description: string[]
  image: string
  buttonText: string
}

const mockCarouselData: CarouselItem[] = [
  {
    id: "1",
    title: "Welcome Bonus",
    description: ["Get a $20 bonus upon registration！", "Maximum win of 500x bonus!"],
    image: "/canada28.png",
    buttonText: "Sign Up",
  }
]

export function GameCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentDescIndex, setCurrentDescIndex] = useState(0)
  const [isStandalone, setIsStandalone] = useState(false)
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  
  // PWA检测
  useEffect(() => {
    // 检测是否在PWA模式(standalone模式)
    setIsStandalone(isPWAMode())
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex === mockCarouselData.length - 1 ? 0 : prevIndex + 1))
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const descTimer = setInterval(() => {
      const currentItem = mockCarouselData[currentIndex]
      if (currentItem.description.length > 1) {
        setCurrentDescIndex((prevIndex) => 
          (prevIndex === currentItem.description.length - 1 ? 0 : prevIndex + 1)
        )
      }
    }, 2000) // 描述文本每2秒切换一次

    return () => clearInterval(descTimer)
  }, [currentIndex])

  // 当轮播项切换时，重置描述索引
  useEffect(() => {
    setCurrentDescIndex(0)
  }, [currentIndex])

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? mockCarouselData.length - 1 : currentIndex - 1)
  }

  const goToNext = () => {
    setCurrentIndex(currentIndex === mockCarouselData.length - 1 ? 0 : currentIndex + 1)
  }

  const handleDownloadApp = () => {
    showPWAInstallPrompt()
  }

  return (
    <div className="relative w-full">
      <Card className="overflow-hidden py-0">
        <CardContent className="p-0">
          <div className="relative h-50 md:h-56">
            <Image
              src={mockCarouselData[currentIndex].image || "/placeholder.svg"}
              alt={mockCarouselData[currentIndex].title}
              className="w-full h-full object-cover"
              fill
            />
            {/* <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" /> */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm">
              <div className="p-4 text-white">
                {/* <h3 className="text-xl font-bold mb-2 text-balance carousel-text">
                  {mockCarouselData[currentIndex].title}
                </h3> */}
                <p className="text-sm mb-3 text-pretty opacity-95 carousel-tex text-center">
                  {mockCarouselData[currentIndex].description[currentDescIndex]}
                </p>
                {/* 在PWA模式下隐藏按钮 */}
                {!isStandalone && (
                  <button
                    className="px-2 py-1 text-xs font-semibold rounded-md shadow-lg transition-colors cursor-pointer flex items-center gap-2"
                    style={{
                      backgroundColor: "#3080ff",
                      color: "#ffffff",
                      border: "1px solid #3080ff",
                    }}
                    onClick={isAuthenticated ? handleDownloadApp : () => router.push("/register")}
                  >
                    {isAuthenticated ? (
                      <>
                        <Download className="h-4 w-4" />
                        Download App
                      </>
                    ) : (
                      mockCarouselData[currentIndex].buttonText
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      {/* <Button
        variant="outline"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white hover:bg-white border-gray-300"
        onClick={goToPrevious}
      >
        <ChevronLeft className="h-4 w-4 text-gray-800" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white hover:bg-white border-gray-300"
        onClick={goToNext}
      >
        <ChevronRight className="h-4 w-4 text-gray-800" />
      </Button> */}

      {/* Dots indicator */}
      {/* <div className="flex justify-center gap-2 mt-4">
        {mockCarouselData.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex ? "bg-accent" : "bg-gray-400"}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div> */}

    </div>
  )
}
