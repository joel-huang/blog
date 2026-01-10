"use client"

import * as React from "react"
import { Instagram, Twitter, Linkedin } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/divelog/components/ui/dialog"

interface DemoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DemoDialog({ open, onOpenChange }: DemoDialogProps) {
  React.useEffect(() => {
    if (open) {
      // Aggressively remove the inline margin-right that Radix UI adds
      const removeMargin = () => {
        const body = document.body
        const html = document.documentElement
        // Override Radix's inline !important style by setting our own with !important
        body.style.setProperty('margin-right', '0', 'important')
        html.style.setProperty('margin-right', '0', 'important')
      }

      // Remove immediately
      removeMargin()

      // Use interval to continuously remove it (Radix keeps re-adding it)
      const intervalId = setInterval(removeMargin, 10)

      // Also watch for style mutations
      const observer = new MutationObserver(() => {
        removeMargin()
      })
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['data-scroll-locked', 'style'],
        attributeOldValue: false
      })
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-scroll-locked', 'style'],
        attributeOldValue: false
      })

      return () => {
        clearInterval(intervalId)
        observer.disconnect()
      }
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            <span className="text-divelog-foreground">
              Hi, this is Joel. This isn't a real app... yet!
            </span>
          </DialogTitle>
          <DialogDescription className="pt-4 space-y-4 text-left">
            <p>
              I built this demo to share my 2025 dives because most dive apps out there are clunky, ugly, and don't let you remember dives the way they unfold through time and depth.
            </p>
            <p>
              If you like this, think it should exist, and will drop a couple dollars on it if it were a real app, send me a DM!
            </p>
            <div className="flex flex-col gap-3 pt-2">
              <a
                href="https://instagram.com/jowlz"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-divelog-foreground hover:text-divelog-primary-foreground cursor-default"
              >
                <Instagram size={20} />
                <span>@jowlz</span>
              </a>
              <a
                href="https://x.com/joel__huang"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-divelog-foreground hover:text-divelog-primary-foreground cursor-default"
              >
                <Twitter size={20} />
                <span>@joel__huang</span>
              </a>
              <a
                href="https://linkedin.com/in/joel-huang"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-divelog-foreground hover:text-divelog-primary-foreground cursor-default"
              >
                <Linkedin size={20} />
                <span>joel-huang</span>
              </a>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
