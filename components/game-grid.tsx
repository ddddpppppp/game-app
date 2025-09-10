"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Users, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"

interface Game {
  id: string
  name: string
  category: string
  image: string
  rating: number
  players: string
  isHot?: boolean
  isNew?: boolean
}

const mockGames: Game[] = [
  {
    id: "canada28",
    name: "Keno",
    category: "Number Games",
    image: "/canada-28-lottery-numbers-game.jpg",
    rating: 4.7,
    players: "9.2K",
    isHot: true,
  }
]

export function GameGrid() {
  const router = useRouter()

  const handleGameSelect = (gameId: string) => {
    if (gameId === "canada28") {
      router.push("/games/canada28")
    } else {
      // For other games, you can add more routes or show a coming soon message
      console.log(`Game ${gameId} selected - route not implemented yet`)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Popular Games</h2>
        <Button variant="ghost" size="sm" className="text-accent">
          View All
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {mockGames.map((game) => (
          <Card key={game.id} className="overflow-hidden hover:shadow-lg transition-shadow py-0 rounded-sm">
            <CardContent className="p-0">
              <div className="relative">
                <img src={game.image || "/placeholder.svg"} alt={game.name} className="w-full h-24 object-cover" />
                <div className="absolute top-2 left-2 flex gap-1">
                  {game.isHot && (
                    <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Hot
                    </Badge>
                  )}
                  {game.isNew && (
                    <Badge
                      className="text-xs px-1.5 py-0.5 border-0"
                      style={{
                        backgroundColor: "#000000 !important",
                        color: "#ffffff !important",
                        border: "none !important",
                      }}
                    >
                      New
                    </Badge>
                  )}
                </div>
              </div>

              <div className="p-3">
                <h3 className="font-semibold text-sm mb-1 text-balance text-card-foreground">{game.name}</h3>
                <p className="text-xs text-muted-on-card mb-2">{game.category}</p>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-card-foreground">{game.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-muted-on-card" />
                    <span className="text-muted-on-card">{game.players}</span>
                  </div>
                </div>

                <span
                  role="button"
                  tabIndex={0}
                  className="block w-full mt-3 px-4 py-2 text-sm font-semibold rounded-md transition-colors cursor-pointer text-center select-none"
                  style={{
                    backgroundColor: "#0f172a !important",
                    color: "#ffffff !important",
                    border: "1px solid #0f172a",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.setProperty("background-color", "#1e293b", "important")
                    e.currentTarget.style.setProperty("color", "#ffffff", "important")
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.setProperty("background-color", "#0f172a", "important")
                    e.currentTarget.style.setProperty("color", "#ffffff", "important")
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      handleGameSelect(game.id)
                    }
                  }}
                  onClick={() => handleGameSelect(game.id)}
                >
                  Play Now
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
