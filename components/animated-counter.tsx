"use client"

import { useEffect, useState } from "react"

interface AnimatedCounterProps {
  value: number
  duration?: number
  suffix?: string
  className?: string
}

export function AnimatedCounter({ value, duration = 1000, suffix = "", className = "" }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const startValue = displayValue
    const difference = value - startValue

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)

      const currentValue = startValue + difference * easeOutQuart
      setDisplayValue(Math.round(currentValue * 10) / 10)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  return (
    <span className={className}>
      {displayValue.toFixed(value % 1 !== 0 ? 1 : 0)}
      {suffix}
    </span>
  )
}
