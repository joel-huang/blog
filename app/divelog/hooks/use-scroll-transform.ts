"use client"

import { useEffect, useRef, useState } from "react"

interface UseScrollTransformOptions {
  maxShift?: number // Maximum shift in pixels (default: 100)
  viewportCenter?: number // Viewport center offset (default: 0.5 for middle)
}

export function useScrollTransform(options: UseScrollTransformOptions = {}) {
  const { maxShift = 100, viewportCenter = 0.5 } = options
  const elementRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState(0)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const updateTransform = () => {
      const rect = element.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const centerY = viewportHeight * viewportCenter
      
      // Calculate distance from card center to viewport center
      const cardCenterY = rect.top + rect.height / 2
      const distanceFromCenter = cardCenterY - centerY
      
      // Normalize distance: -1 when card is far above, 0 when centered, 1 when far below
      // Use a smooth curve that peaks at center
      const normalizedDistance = distanceFromCenter / (viewportHeight / 2)
      
      // Create a bell curve effect: shift left when approaching center, back right when moving away
      // Using a quadratic function: 1 - (distance^2) gives us a peak at center
      const shiftFactor = 1 - Math.min(1, Math.abs(normalizedDistance) * 2) ** 2
      
      // Shift left (negative) when approaching center
      const shift = -shiftFactor * maxShift
      
      setTransform(shift)
    }

    // Initial update
    updateTransform()

    // Update on scroll
    window.addEventListener("scroll", updateTransform, { passive: true })
    window.addEventListener("resize", updateTransform, { passive: true })

    return () => {
      window.removeEventListener("scroll", updateTransform)
      window.removeEventListener("resize", updateTransform)
    }
  }, [maxShift, viewportCenter])

  return { elementRef, transform }
}
