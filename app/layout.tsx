import type React from "react"
import type { Metadata } from "next"
import { GeistSans, GeistMono } from "geist/font"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth-provider"
import { AppLayout } from "@/components/app-layout"

// 启用全局错误处理
import "@/lib/utils/global-error-handler"

export const metadata: Metadata = {
  title: "Keno Canada28",
  description: "Ultimate Keno and Canada28 gaming experience",
  generator: 'v0.app',
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
  manifest: "/manifest.json",
  themeColor: "#ffd700",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Keno Canada28",
    startupImage: [
      {
        url: "/icons/icon-192x192.png",
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)"
      }
    ]
  },
  openGraph: {
    type: "website",
    siteName: "Keno Canada28",
    title: "Keno Canada28",
    description: "Ultimate Keno and Canada28 gaming experience",
    images: ["/icons/icon-512x512.png"]
  },
  twitter: {
    card: "summary",
    title: "Keno Canada28",
    description: "Ultimate Keno and Canada28 gaming experience",
    images: ["/icons/icon-512x512.png"]
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    shortcut: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
    other: {
      rel: "apple-touch-icon-precomposed",
      url: "/icons/icon-192x192.png"
    }
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} antialiased`} suppressHydrationWarning>
      <body>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem 
          disableTransitionOnChange
          storageKey="game-theme"
        >
          <AuthProvider>
            <AppLayout>{children}</AppLayout>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
