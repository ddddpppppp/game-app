"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const Carousel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("relative", className)} role="region" aria-roledescription="carousel" {...props} />
  ),
)
Carousel.displayName = "Carousel"

const CarouselContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("overflow-hidden", className)} {...props} />,
)
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("min-w-0 shrink-0 grow-0 basis-full", className)}
      role="group"
      aria-roledescription="slide"
      {...props}
    />
  ),
)
CarouselItem.displayName = "CarouselItem"

const CarouselPrevious = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, variant = "outline", size = "icon", ...props }, ref) => (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn("absolute h-8 w-8 rounded-full left-4 top-1/2 -translate-y-1/2", className)}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  ),
)
CarouselPrevious.displayName = "CarouselPrevious"

const CarouselNext = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, variant = "outline", size = "icon", ...props }, ref) => (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn("absolute h-8 w-8 rounded-full right-4 top-1/2 -translate-y-1/2", className)}
      {...props}
    >
      <ChevronRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  ),
)
CarouselNext.displayName = "CarouselNext"

export { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious }
