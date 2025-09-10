"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CarouselItem {
  id: string
  title: string
  description: string
  image: string
  buttonText: string
}

const mockCarouselData: CarouselItem[] = [
  {
    id: "1",
    title: "Welcome Bonus",
    description: "Get 100% bonus on your first deposit up to $500!",
    image: "/casino-welcome-bonus-golden-coins.jpg",
    buttonText: "Claim Now",
  },
  {
    id: "2",
    title: "Mega Jackpot",
    description: "Progressive jackpot now over $1,000,000!",
    image: "/mega-jackpot-slot-machine-golden.jpg",
    buttonText: "Play Now",
  },
  {
    id: "3",
    title: "Tournament Week",
    description: "Join our weekly tournament and win big prizes!",
    image: "/poker-tournament-championship-trophy.jpg",
    buttonText: "Join Tournament",
  },
]

export function GameCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex === mockCarouselData.length - 1 ? 0 : prevIndex + 1))
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? mockCarouselData.length - 1 : currentIndex - 1)
  }

  const goToNext = () => {
    setCurrentIndex(currentIndex === mockCarouselData.length - 1 ? 0 : currentIndex + 1)
  }

  return (
    <div className="relative w-full">
      <Card className="overflow-hidden py-0">
        <CardContent className="p-0">
          <div className="relative h-48 md:h-56">
            <img
              src={mockCarouselData[currentIndex].image || "/placeholder.svg"}
              alt={mockCarouselData[currentIndex].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm">
              <div className="p-4 text-white">
                <h3 className="text-xl font-bold mb-2 text-balance carousel-text">
                  {mockCarouselData[currentIndex].title}
                </h3>
                <p className="text-sm mb-3 text-pretty opacity-95 carousel-text">
                  {mockCarouselData[currentIndex].description}
                </p>
                <button
                  className="px-4 py-2 text-sm font-semibold rounded-md shadow-lg transition-colors cursor-pointer"
                  style={{
                    backgroundColor: "#0f172a",
                    color: "#ffffff",
                    border: "1px solid #0f172a",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#1e293b"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#0f172a"
                  }}
                >
                  {mockCarouselData[currentIndex].buttonText}
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <Button
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
      </Button>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {mockCarouselData.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex ? "bg-accent" : "bg-gray-400"}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  )
}
