"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, ExternalLink, X } from "lucide-react"

interface IframeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  url: string
  title?: string
  className?: string
}

export function IframeDialog({ 
  open, 
  onOpenChange, 
  url, 
  title = "Loading...",
  className = "w-full h-[70vh]"
}: IframeDialogProps) {
  const [loading, setLoading] = useState(true)

  const handleOpenExternal = () => {
    window.open(url, '_blank')
  }

  const handleIframeLoad = () => {
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${className} p-0 m-0 translate-y-0 data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom fixed bottom-0 left-o right-0 top-auto rounded-t-xl rounded-b-none border-b-0 flex flex-col overflow-hidden max-w-full max-h-full`}>
          
          <div className="w-full flex-1 relative">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Loading...</span>
                </div>
              </div>
            )}
            
            <iframe
              src={url}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
              title={title}
            />
            
          </div>
        
      </DialogContent>
    </Dialog>
  )
}
