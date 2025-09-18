"use client"

import { GameCarousel } from "@/components/game-carousel"
import { GameGrid } from "@/components/game-grid"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { useProfile } from "@/hooks/use-profile"
import { useRouter } from "next/navigation"

export function HomePage() {
  const { isAuthenticated } = useAuth()
  const { user } = useProfile()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-card-foreground">GameHub</h1>
            <p className="text-xs text-muted-on-card">
              {isAuthenticated ? "Welcome back, Player!" : "Welcome to GameHub!"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <div className="text-right">
                <p className="text-xs text-muted-on-card">Balance</p>
                <p className="text-sm font-semibold text-accent">${user?.balance}</p>
              </div>
            ) : (
              <Button
                onClick={() => router.push("/login")}
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="p-4 space-y-6">
        {/* Carousel section */}
        <GameCarousel />

        {/* Games grid */}
        <GameGrid />
      </div>
    </div>
  )
}
