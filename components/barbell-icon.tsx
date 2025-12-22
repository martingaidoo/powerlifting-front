"use client"

import { useEffect, useRef } from "react"

interface BarbellIconProps {
  className?: string
  animate?: boolean
}

export function BarbellIcon({ className = "", animate = false }: BarbellIconProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (animate && svgRef.current) {
      const plates = svgRef.current.querySelectorAll(".plate")
      plates.forEach((plate, index) => {
        ;(plate as SVGElement).style.animation = `scale-in 0.3s ease-out ${index * 0.1}s forwards`
        ;(plate as SVGElement).style.opacity = "0"
        ;(plate as SVGElement).style.transform = "scale(0.8)"
      })
    }
  }, [animate])

  return (
    <svg ref={svgRef} viewBox="0 0 200 60" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Left outer plate */}
      <rect className="plate" x="10" y="10" width="12" height="40" rx="2" fill="currentColor" opacity="0.9" />
      {/* Left inner plate */}
      <rect className="plate" x="24" y="15" width="10" height="30" rx="2" fill="currentColor" opacity="0.7" />
      {/* Left sleeve */}
      <rect x="36" y="22" width="15" height="16" rx="1" fill="currentColor" opacity="0.5" />
      {/* Bar */}
      <rect x="51" y="26" width="98" height="8" rx="1" fill="currentColor" opacity="0.4" />
      {/* Right sleeve */}
      <rect x="149" y="22" width="15" height="16" rx="1" fill="currentColor" opacity="0.5" />
      {/* Right inner plate */}
      <rect className="plate" x="166" y="15" width="10" height="30" rx="2" fill="currentColor" opacity="0.7" />
      {/* Right outer plate */}
      <rect className="plate" x="178" y="10" width="12" height="40" rx="2" fill="currentColor" opacity="0.9" />
      {/* Knurling marks */}
      <g opacity="0.3">
        <line x1="70" y1="28" x2="70" y2="32" stroke="currentColor" strokeWidth="1" />
        <line x1="75" y1="28" x2="75" y2="32" stroke="currentColor" strokeWidth="1" />
        <line x1="80" y1="28" x2="80" y2="32" stroke="currentColor" strokeWidth="1" />
        <line x1="120" y1="28" x2="120" y2="32" stroke="currentColor" strokeWidth="1" />
        <line x1="125" y1="28" x2="125" y2="32" stroke="currentColor" strokeWidth="1" />
        <line x1="130" y1="28" x2="130" y2="32" stroke="currentColor" strokeWidth="1" />
      </g>
    </svg>
  )
}
