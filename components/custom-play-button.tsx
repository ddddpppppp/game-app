"use client"

import type React from "react"

interface CustomPlayButtonProps {
  onClick: () => void
  children: React.ReactNode
  className?: string
}

export function CustomPlayButton({ onClick, children, className = "" }: CustomPlayButtonProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick()
        }
      }}
      className={`cursor-pointer select-none ${className}`}
      style={{
        backgroundColor: "#000000",
        color: "#ffffff",
        padding: "8px 16px",
        borderRadius: "6px",
        fontSize: "14px",
        fontWeight: "500",
        textAlign: "center",
        border: "none",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#1a1a1a"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "#000000"
      }}
    >
      {children}
    </div>
  )
}
